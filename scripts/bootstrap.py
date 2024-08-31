import threading

import requests

FILENAME = "data/hn.csv"
NUMBER_OF_THREADS = 8

domains = open(FILENAME, "r").read().split("\n")


def process(domain):
    print(f"Requesting {domain}")
    requests.get(f"https://shovel.report/{domain}")


def chunkify(lst, n):
    return [lst[i::n] for i in range(n)]


if __name__ == "__main__":
    domain_batches = chunkify(domains, NUMBER_OF_THREADS)
    threads = []
    for batch in domain_batches:
        t = threading.Thread(target=lambda: [process(domain) for domain in batch])
        threads.append(t)
        t.start()
