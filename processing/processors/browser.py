class BrowserProcessor:
    def process(self, data):
        counter = 0
        for tracked in data["tracked_urls"]:
            tracked = self.__get_tracked_ur_data(tracked)
            # moodle page is inactive
            if "online.ase.ro" in tracked["url"] and tracked["active"] is False:
                return True
            # check for disallowed websites
            for allowed in data["allowed_urls"]:
                if allowed in tracked["url"]:
                    counter = counter + 1
        if len(data["tracked_urls"]) != counter:
            return True
        return False

    def __get_tracked_ur_data(self, data):
        chunks = data.split("#")

        return {
            "action": self.__process_chunk(chunks, 'action'),
            "active": self.__process_chunk(chunks, 'active'),
            "url": self.__process_chunk(chunks, 'url'),
            "highlighted": self.__process_chunk(chunks, 'highlighted'),
            "audible": self.__process_chunk(chunks, 'audible')
        }

    def __process_chunk(self, chunks, verb):
        chunk = list(filter(lambda c: verb in c, chunks))
        if len(chunk) != 1:
            raise Exception("verb not found")
        chunk = chunk[0]
        chunk = chunk.replace("[", "")
        chunk = chunk.replace("]", "")
        value = chunk.replace(verb + "_", "")
        if value == "true":
            return True
        if value == "false":
            return False

        return value
