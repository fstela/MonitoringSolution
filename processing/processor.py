import processors


def __validate_message(message):
    return True


class DataProcessor:

    def __init__(self, storage):
        self.__storage = storage
        self.__video_processor = processors.VideoProcessor()
        self.__audio_processor = processors.AudioProcessor()
        self.__keys_processor = processors.KeysProcessor()
        self.__browser_processor = processors.BrowserProcessor()

    def process_message(self, message):
        print('Received: {}'.format(self, message))
        # validate
        processing_result = {
            "audio": self.__process_audio(message.audio),
            "video": self.__process_video(message.video),
            "keys": self.__process_keys(message.keys),
            "browser": self.__process_browser(message.browser)
        }

        return {"data": message, "results": processing_result}

    def __process_audio(self, path):
        file = self.__storage.get_file(path)
        return self.__audio_processor.process(file)

    def __process_video(self, path):
        file = self.__storage.get_file(path)
        return self.__video_processor.process(file)

    def __process_keys(self, keys):
        return self.__keys_processor.process(keys)

    def __process_browser(self, data):
        return self.__browser_processor.process(data)
