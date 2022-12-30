import numpy as np
from matplotlib import pyplot as plt
import wave, pydub, math

def remove_noise(filename):
    pass

# y1 = pydub.AudioSegment.from_wav("data/test.wav").get_array_of_samples()
if False:
    x = [0]
    for i in range(100):
        x.append(x[-1] + 0.1)

    y1 = [ math.sin(t*2*np.pi) + math.sin(4*np.pi*t) + math.sin(1.25*np.pi*t) for t in x ]
    y2 = (np.fft.fft(y1))
    y3 = [ v if v > np.percentile(y2, 99) else 0 for v in y2 ]
    y4 = np.fft.ifft(y3)


    fig, axs = plt.subplots(2, 2)

    axs[0, 0].plot(x, y1)
    axs[0, 0].set_title('Pre Transformation')

    axs[0, 1].plot(x, y2)
    axs[0, 1].set_title("Fourier Transformed")

    axs[1, 0].plot(x, y3)
    axs[1, 0].set_title("Flattened (99%)")

    axs[1, 1].plot(x, y4)
    axs[1, 1].set_title("Inverse Fourier Transformed")


    # 2 highest points which arent connected to higher points
    i = 1
    points = []
    while i < len(y3)-1:
        if y3[i] > y3[i-1] and y3[i] > y3[i+1]:
            points.append(x[i])
        i += 1

    print(points)

    plt.show()
else:
    print('y1')
    y1 = pydub.AudioSegment.from_wav("data/2022-12-27 12.28.11.583409.wav").get_array_of_samples()
    x = [ i for i in range(len(y1))]
    print('y2')
    y2 = np.fft.fft(y1)
    print('p')
    p = np.percentile(np.abs(y2), 85)
    print('y3')
    y3 = [ v if np.abs(v) > p else 0 for v in y2 ]
    print('y4')
    y4 = np.fft.ifft(y3)
    print('done')

    fig, axs = plt.subplots(2, 2)

    axs[0, 0].plot(x, y1)
    axs[0, 0].set_title('Pre Transformation')

    axs[0, 1].plot(x, y2)
    axs[0, 1].set_title("Fourier Transformed")

    axs[1, 0].plot(x, y3)
    axs[1, 0].set_title("Flattened (99%)")

    axs[1, 1].plot(x, y4)
    axs[1, 1].set_title("Inverse Fourier Transformed")


    # 2 highest points which arent connected to higher points
    i = 1
    points = []
    while i < len(y3)-1:
        if y3[i] > y3[i-1] and y3[i] > y3[i+1]:
            points.append(x[i])
        i += 1

    print(points)

    plt.show()