class BrowserProcessor:
    def process(self, data):
        COUNTER = 0
        for tracked in data["tracked_urls"]:
            for allowed in data["allowed_urls"]:
                if allowed in tracked:
                    COUNTER = COUNTER + 1
        if len(data["tracked_urls"]) != COUNTER:
            return False
        return True
