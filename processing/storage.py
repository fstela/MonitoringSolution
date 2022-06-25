from minio import Minio

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


