const fs = require('node:fs/promises');
const fsSync = require('node:fs')
const axios = require('axios');


class Export {

    export_dir_path = './export'
    instances = [];
    url = 'http://localhost:8042';
   
    constructor() {
        // if export directory doesn't exist it will create it
        if(!fsSync.existsSync(this.export_dir_path)) {
            fsSync.mkdirSync(this.export_dir_path)
        }
        this.getInstances()
    }
    async getInstances() {
        const res = await axios.get(this.url + '/instances');
        this.instances = res.data;
    }

    async downloadAndWriteForEachInstance() {
        let started = Date.now();
        let count = 0;
        let total = this.instances.length;
        for (let i = 0; i < this.instances.length; i++) {
            
            const file = await axios.get(this.url + '/instances/' + this.instances[i] + '/file', { responseType: 'stream'});
            const openFile = await fs.open(`./export/${this.instances[i]}.dcm`, 'w');
            const writeTo = openFile.createWriteStream();
            file.data.pipe(writeTo)
            count++;
            console.clear()
            console.log(`
                Exporting Started for ${total} instances as dicom image
                Downloading... (${count}/${total})`);

        };
        console.log("Completed after " + (parseInt((Date.now() - started) / 1000)) + ' seconds')

    }

}


const ex = new Export();

(async () => {
    await ex.getInstances();
    await ex.downloadAndWriteForEachInstance();
})();