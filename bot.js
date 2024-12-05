const fs = require('fs');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const readline = require('readline');
const ora = require('ora');

// Konfigurasi konstanta
const CONFIG = {
    MAX_RETRIES: 3,
    REQUEST_TIMEOUT: 5000,
    API_BASE_URL: 'https://api.nodepay.network',
    RETRY_DELAY_BASE: 2000
};

// Fungsi untuk logging sederhana
const logger = {
    info: (message, data = {}) => {
        const timestamp = new Date().toISOString();
        console.log(`[INFO] ${timestamp}: ${message}`, data);
    },
    error: (message, data = {}) => {
        const timestamp = new Date().toISOString();
        console.error(`[ERROR] ${timestamp}: ${message}`, data);
        // Simpan log ke file
        const logEntry = `${timestamp} [ERROR] ${message} ${JSON.stringify(data)}\n`;
        fs.appendFileSync('error.log', logEntry);
    },
    warn: (message, data = {}) => {
        const timestamp = new Date().toISOString();
        console.warn(`[WARN] ${timestamp}: ${message}`, data);
    }
};

// Fungsi untuk membaca dan validasi file konfigurasi
function readConfig(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf-8');
        if (!content.includes('=')) {
            throw new Error(`Format file ${filename} tidak valid`);
        }
        return content.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});
    } catch (error) {
        logger.error(`Error membaca file ${filename}:`, { error: error.message });
        throw new Error(`Gagal membaca konfigurasi dari ${filename}`);
    }
}

// Fungsi untuk validasi konfigurasi
function validateConfig(config) {
    const requiredFields = ['ID_TOKEN', 'USER_EMAIL'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Field yang diperlukan tidak ada: ${missingFields.join(', ')}`);
    }
    return true;
}

// Fungsi untuk validasi proxy URL
function validateProxyUrl(url) {
    if (!url) return false;
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}

// Fungsi untuk membuat instance axios
function createAxiosInstance(proxyUrl = null) {
    const config = {
        timeout: CONFIG.REQUEST_TIMEOUT,
        headers: {
            'User-Agent': 'NodepayNetwork-Bot/1.0',
            'Content-Type': 'application/json'
        }
    };

    if (proxyUrl && validateProxyUrl(proxyUrl)) {
        config.httpsAgent = new HttpsProxyAgent(proxyUrl);
    }

    return axios.create(config);
}

// Fungsi utama untuk koneksi ke network
async function connectToNodepayNetwork(axiosInstance, credentials) {
    try {
        const connectResponse = await axiosInstance.get(`${CONFIG.API_BASE_URL}/connect`, {
            params: { token: credentials.ID_TOKEN }
        });

        const pingResponse = await axiosInstance.get(`${CONFIG.API_BASE_URL}/ping`, {
            params: { token: credentials.ID_TOKEN }
        });

        logger.info('Koneksi berhasil', {
            userId: credentials.USER_EMAIL,
            connectionId: credentials.ID_TOKEN
        });

        return { connectResponse, pingResponse };
    } catch (error) {
        logger.error('Kesalahan koneksi', {
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
}

// Fungsi dengan mekanisme retry yang ditingkatkan
async function connectWithRetry(axiosInstance, credentials) {
    for (let retries = 0; retries < CONFIG.MAX_RETRIES; retries++) {
        try {
            const result = await connectToNodepayNetwork(axiosInstance, credentials);
            return { success: true, data: result };
        } catch (error) {
            const waitTime = CONFIG.RETRY_DELAY_BASE * Math.pow(2, retries);
            logger.warn(`Percobaan koneksi ke-${retries + 1} gagal`, {
                error: error.message,
                nextRetryIn: waitTime
            });

            if (retries === CONFIG.MAX_RETRIES - 1) {
                return { success: false, error: error.message };
            }

            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Fungsi utama
async function main() {
    const spinner = ora('Memulai Nodepay Network Bot...').start();
    
    try {
        // Baca konfigurasi
        const credentials = readConfig('token.txt');
        validateConfig(credentials);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const useProxy = await new Promise(resolve => {
            rl.question('Gunakan proxy? (yes/no): ', answer => {
                rl.close();
                resolve(answer.toLowerCase() === 'yes');
            });
        });

        const proxyConfig = useProxy ? readConfig('proxy.txt') : null;
        const proxyUrl = proxyConfig?.PROXY_URL;
        const axiosInstance = createAxiosInstance(proxyUrl);

        spinner.text = 'Menghubungkan ke Nodepay Network...';
        const { success, data, error } = await connectWithRetry(axiosInstance, credentials);

        if (success) {
            spinner.succeed('Berhasil terhubung ke Nodepay Network!');
            console.log('='.repeat(50));
            console.log(`Node ID: ${credentials.ID_TOKEN}`);
            console.log(`Email: ${credentials.USER_EMAIL}`);
            console.log('='.repeat(50));
        } else {
            spinner.fail(`Gagal terhubung: ${error}`);
            process.exit(1);
        }

    } catch (error) {
        spinner.fail(error.message);
        logger.error('Fatal error', { error: error.message });
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    logger.info('Program dihentikan oleh pengguna');
    console.log('\nMenghentikan program...');
    process.exit(0);
});

// Jalankan program
main().catch(error => {
    logger.error('Uncaught error', { error: error.message });
    console.error('Fatal error:', error.message);
    process.exit(1);
});
