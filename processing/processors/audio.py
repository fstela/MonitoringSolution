import moviepy.editor
import speech_recognition


class AudioProcessor:
    def process(self, file):
        video = moviepy.editor.VideoFileClip(file)
        audio = video.audio
        audio.write_audiofile("filename.wav")
        recognizer = speech_recognition.Recognizer()
        filename = speech_recognition.AudioFile("filename.wav")

        with filename as source:
            # recognizer.adjust_for_ambient_noise(source, duration=0.2)
            audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio, show_all=True)
            if len(text) == 0:
                return True

        except speech_recognition.UnknownValueError():
            recognizer = speech_recognition.Recognizer()
        return False
