const Minio = require("minio");
const S3 = require('aws-sdk/clients/s3');
const {PutObjectCommand} = require("@aws-sdk/client-s3");
class StorageService {
    #BUCKET_NAME = "monitoring"
    #client;
    constructor() {
        this.#client = new S3({
            endpoint: "127.0.0.1:9060",
            accessKeyId: "mmmm12345",
            secretAccessKey: "xxxx12345",
            sslEnabled: false,
            s3ForcePathStyle: true,
            signatureVersion: 'v4'
        })
    }

    saveFile = async (name, content) => {
        const data = {
            Bucket: this.#BUCKET_NAME,
            Key: name,
            Body: content
        };
        await this.#client.putObject(data, (err, data) => {
            console.log("Upload result: ", "error:" + err, data);
        })
    }

    getPublicUrl = (name) => {
        return `http://localhost:9060/${this.#BUCKET_NAME}/${name}`
    }
}

module.exports = new StorageService();