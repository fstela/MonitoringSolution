import os

from minio import Minio

TEMP_DOWNLOAD_FOLDER_PATH = "./tmp"


class Storage:
    def __init__(self, url, access_key, secret_key, bucket_name):
        self.client = Minio(url, access_key, secret_key, secure=False)
        self.bucket_name = bucket_name

    def get_file(self, path):
        try:
            response = self.client.get_object(
                self.bucket_name,
                path
            )
            return response.data
        finally:
            response.close()
            response.release_conn()

    def fetch_tmp_file(self, path):
        tmp_file_path = TEMP_DOWNLOAD_FOLDER_PATH + "/" + path
        self.client.fget_object(
            bucket_name=self.bucket_name,
            object_name=path,
            file_path=tmp_file_path
        )

        return tmp_file_path

    def rm_tmp_file(self, path):
        if path.startswith(TEMP_DOWNLOAD_FOLDER_PATH):
            os.remove(path)