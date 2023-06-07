import os, time

def get_size(start_path = '.'):
    """https://stackoverflow.com/a/1392549"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)

    return total_size / (1024**3)

if __name__ == "__main__":
    while True:
        s = get_size('g:/My Drive/tasmetu-archive')
        if s > 14:
            print(f'Size ({s}) too large...')
            f = 'g:/My Drive/tasmetu-archive/' + os.listdir('g:/My Drive/tasmetu-archive')[0]
            print('Deleting "{f}"')
            os.rmdir(f)
        time.sleep(60)