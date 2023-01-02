import wave
import numpy as np
from scipy.signal import wiener

# Open the WAV file
with wave.open('data/lapdtest.wav', 'rb') as wav_file:
    # Read the audio data and sample rate from the file
    audio_data = wav_file.readframes(wav_file.getnframes())
    sample_rate = wav_file.getframerate()

# Convert the audio data to a NumPy array
audio_data = np.frombuffer(audio_data, dtype=np.int16)

filtered = wiener(audio_data)

# Open a new WAV file to write the filtered data to
with wave.open('filtered_file.wav', 'wb') as wav_file:
    # Set the parameters for the WAV file
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)

    # Write the filtered data to the file
    filtered_bytes = filtered.astype(np.int16).tobytes()
    wav_file.writeframes(filtered_bytes)
