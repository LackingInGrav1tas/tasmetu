import speech_recognition as sr
from audio_scanner import AudioScanner

_r = sr.Recognizer()
_methods = [ _r.recognize_google, _r.recognize_sphinx, lambda a : "[unrecognized]" ]

def transcribe(path):
    with sr.AudioFile(path) as source:
        audio = _r.record(source)
        for method in _methods:
            try:
                return method(audio)
            except: pass