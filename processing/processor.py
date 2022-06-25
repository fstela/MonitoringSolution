from processors import audio, video, browser, keys
from jsonschema import validate
import json


class DataProcessor:

    def __init__(self, storage):
        self.__storage = storage
        self.__video_processor = video.VideoProcessor()
        self.__audio_processor = audio.AudioProcessor()
        self.__keys_processor = keys.KeysProcessor()
        self.__browser_processor = browser.BrowserProcessor()
        self.__validation_schema = {
            "type": "object",
            "properties": {
                "video": {"type": "string"},
                "keys": {"type": "array", "items": {"type": "string"}},
                "browser": {"type": "array", "items": {"type": "string"}},
            }
        }

    def process_message(self, message):
        print('Received: {}'.format(self, message))
        data = self.__validate(message)
        file_bytes = self.__get_file_bytes(data["video"])
        processing_result = {
            "audio": self.__process_audio(file_bytes),
            "video": self.__process_video(file_bytes),
            "keys": self.__process_keys(data["keys"]),
            "browser": self.__process_browser(data["browser"])
        }

        return {"data": data, "results": processing_result}

    def __get_file_bytes(self, path):
        content = self.__storage.get_file(path)
        return content

    def __validate(self, message):
        data = json.loads(message)
        validate(data, schema=self.__validation_schema)
        return data

    def __process_audio(self, bytes):
        return self.__audio_processor.process(bytes)

    def __process_video(self, bytes):
        return self.__video_processor.process(bytes)

    def __process_keys(self, keys):
        return self.__keys_processor.process(keys)

    def __process_browser(self, data):
        return self.__browser_processor.process(data)
