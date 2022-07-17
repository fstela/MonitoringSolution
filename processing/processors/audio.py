import os

import speech_recognition
import subprocess


class AudioProcessor:
    def process(self, path):
        audio_file_temp_path = path.replace(".webm", ".wav")
        self.extract_audio(path, audio_file_temp_path)
        recognizer = speech_recognition.Recognizer()
        filename = speech_recognition.AudioFile(audio_file_temp_path)

        with filename as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio, show_all=True)
            if len(text) == 0:
                return True
        except speech_recognition.UnknownValueError():
            recognizer = speech_recognition.Recognizer()
        finally:
            os.remove(audio_file_temp_path)

        return False

    def extract_audio(self, video_file_path, output_path):
        subprocess.run(
            ['ffmpeg', '-y', '-i', video_file_path, '-vn', output_path],
            # remove stout & sterr to see ffmpeg logs/erros
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT
        )
