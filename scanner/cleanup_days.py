import datetime, os, time, shutil

def date_difference(p):
    # year-month-day (day of week)
    s = p.split('-')
    f_date = datetime.date(int(s[0]), int(s[1]), int(s[2].split(' ')[0]))
    delta = datetime.date.today() - f_date
    return delta.days

while True:
    path = 'g:/My Drive/tasmetu-archive'
    dirs = [x[0] for x in os.walk(path)]
    dirs.pop(0)
    for dir in dirs:
        n = dir.split('g:/My Drive/tasmetu-archive')[1][1:-1]
        if date_difference(n) > 5:
            shutil.rmtree(dir, ignore_errors=True)
    print("cycle")
    time.sleep(100)