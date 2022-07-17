class KeysProcessor:
    def process(self, data):
        for key in data:
            if key == "meta+c" or key == "meta+v" or key == "meta+f" or key == "ctrl+c" or key == "ctrl+v" or key == "ctrl+f":
                return True
        return False
