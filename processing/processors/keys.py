class KeysProcessor:
    def process(self, data):
        for key in data:
            if key == "inactive browser":
                return False
            elif key[0] == "[" and key[len(key)-1] == "]":
                if key == "[CTRL+V]" or key == "[CTRL+C]" or key == "[CTRL+F]" :
                    return False
            return True
