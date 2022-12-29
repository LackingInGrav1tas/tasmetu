import numpy as np
from matplotlib import pyplot as plt
import wave, pydub, math

def remove_noise(filename):
    pass

# y1 = pydub.AudioSegment.from_wav("data/test.wav").get_array_of_samples()
x = [0]
for i in range(100):
    x.append(x[-1] + 0.1)

y1 = [ math.sin(t*2*np.pi) + math.sin(4*np.pi*t) for t in x ]
y2 = np.abs(np.fft.fft(y1))
y3 = [ v if v > np.percentile(y2, 95) else 0 for v in y2 ]

fig, axs = plt.subplots(2, 2)

axs[0, 0].plot(x, y1)
axs[0, 0].set_title('Pre Transformation')

axs[0, 1].plot(x, y2)
axs[0, 1].set_title("Fourier Transformed")

axs[1, 0].plot(x, y3)
axs[1, 0].set_title("Flattened")

plt.show()