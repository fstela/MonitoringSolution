from processors.video import VideoProcessor
from processors.audio import AudioProcessor
from processors.browser import BrowserProcessor
from processors.keys import KeysProcessor

if __name__ == '__main__':
    test_file_path = "./test.webm"
    vp = VideoProcessor()
    res_vp = vp.process(test_file_path)
    ap = AudioProcessor()
    res_ap = ap.process(test_file_path)
    bp = BrowserProcessor()
    browser_data = {
        "allowed_urls": ['google.ro', 'wikipedia.org'],
        "tracked_urls": ['https://google.ro/sdadadasd', 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope', "https://github.com/kkroening/ffmpeg-python/issues/251"]
    }
    bp_res = bp.process(browser_data)
    kp = KeysProcessor()
    keys_data = ["[CTRL+V]", "[CTRL+F]", "[CTRL+C]"]
    kp_res = kp.process(keys_data)
    print("vp: {}, ap: {}, bp: {}, kp: {}".format(res_vp, res_ap, bp_res, kp_res))
