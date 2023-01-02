import pyaudio, wave, multiprocessing
import numpy as np
from matplotlib import pyplot as plt

p = pyaudio.PyAudio()

class AudioScanner:
    def __init__(self, chunk, format, channels, rate, threshold, silence):
        self.visualize = False
        self.chunk = chunk
        self.format = format
        self.channels = channels
        self.rate = rate
        self.threshold = threshold
        self.fn = None
        self.silence = silence

    def __del__(self):
        if self.visualize: self.v.terminate()

    def _visualization(self):
        s = p.open(format=self.format, channels=self.channels, rate=self.rate, input=True, frames_per_buffer=self.chunk)

        x = [ i for i in range(50)]
        y = [ 0 for i in range(50) ]

        plt.figure(num="Audio Stream")
        plt.title("Audio Stream", color="white", weight=700)
        plt.ylim([0, 3000])

        while True:
            data = s.read(self.chunk)
            audio_data = np.frombuffer(data, dtype=np.int16)
            volume = np.abs(audio_data).mean()

            plt.clf()
            y = y[1:]
            y.append(volume)
            plt.plot(x, y, label="stream")
            plt.plot(x, [self.threshold for i in range(50)])
            plt.ylabel("volume")
            plt.pause(0.01)

    def begin_visualization(self):
        """Starts realtime audio stream visualization"""
        self.v = multiprocessing.Process(target=self._visualization, args=())
        self.v.start()
        self.visualize = True

    def onReceive(self, function, name_function):
        """Upon receiving audio above the threshold, AudioScanner saves the recording to a file named name_function().
        It then calls function with the file name as its argument. If function() returns True, the loop exits."""
        self.fn = function
        self.name_fn = name_function       

    def listen(self):
        """Audio scanner main loop"""
        stream = p.open(format=self.format, channels=self.channels, rate=self.rate, input=True, frames_per_buffer=self.chunk)
        
        recording = False
        elapsed_silence = 0
        while True:
            data = stream.read(self.chunk)
            audio_data = np.frombuffer(data, dtype=np.int16)
            volume = np.abs(audio_data).mean()
            
            if volume >= self.threshold:
                elapsed_silence = 0

                if not recording:
                    # output file
                    audio_file = self.name_fn()

                    wf = wave.open(audio_file, 'wb')
                    wf.setnchannels(self.channels)
                    wf.setsampwidth(p.get_sample_size(self.format))
                    wf.setframerate(self.rate)

                recording = True

            if recording:
                wf.writeframes(data)

                if volume < self.threshold:
                    if elapsed_silence > 100:
                        recording = False
                        elapsed_silence = 0
                        wf.close()
                        if self.fn(audio_file): break

                    else: elapsed_silence += 1