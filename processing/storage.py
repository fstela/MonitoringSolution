from minio import Minio


class Storage:
    def __init__(self, url, access_key, secret_key):
        self.client = Minio(url, access_key, secret_key)

    def get_file(self, path):
        try:
            response = self.client.get_object(
                "bucket",
                path
            )
        finally:
            response.close()
            response.release_conn()

        return response
