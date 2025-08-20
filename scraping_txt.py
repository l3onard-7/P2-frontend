### employ webscraping to extract text from a website for the 
import os
import requests
from bs4 import BeautifulSoup
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse
import shutil
from tempfile import NamedTemporaryFile

# need to check if the website allows scraping
def can_scrape(url):
    parsed_url = urlparse(url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    rp = RobotFileParser()
    rp.set_url(robots_url)
    rp.read()
    return rp.can_fetch("*", url)

def is_low_value_content(text):
    """Returns True if the text is likely an error page or low-value."""
    error_phrases = [
        "please enable cookies",
        "you have been blocked",
        "access denied",
        "cloudflare",
        "error",
        "not found",
        "page not found",
        "forbidden",
        "unavailable",
        "robot check",
        "your ip",
        "security service",
        "blocked",
        "could not be found",
        "404",
        "captcha"
    ]
    text_lower = text.lower()
    return (
        len(text_lower) < 200 or
        any(phrase in text_lower for phrase in error_phrases)
    )


### makes new file with the scraped text from the website
def scrape_save(url, test=False):
    try:
        page = requests.get(url)    
        soup = BeautifulSoup(page.content, "html.parser")


        for element in soup(["script", "style", "nav", "footer"]):
            element.decompose()

        main_content = (
            soup.find("main") or
            soup.find("article") or
            soup.find("div", {"id": "content"}) or
            soup.find("div", {"id": "main-content"}) or
            soup.find("div", {"class": "content"}) or
            soup.find("div", {"class": "main-content"}) or
            soup.find("body")
        )
        text = main_content.get_text(separator="\n", strip=True)    

        if is_low_value_content(text):
            print(f"Filtered out low-value or error page: {url}")
            return None
        
        if test==True:
            print(f"Scraping {url}...")
            print(soup.prettify()) 
            return None

        parsed_url = urlparse(url)
        filename = f"{parsed_url.netloc}{parsed_url.path.replace('/', '_')}.txt"
        filepath = os.path.join(SCRAPED_DIR, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"URL: {url}\n\n")  
            f.write(text)
        return filepath
    
    except Exception  as e:
        print(f"Failed to scrape {url}: {e}")
        return None

# deletes successfully scraped urls from websearched_urls
def delete_from_newurls(urls_to_delete):
    try:
        with NamedTemporaryFile(mode='w', delete=False, encoding='utf-8') as tmp:
            with open(new_urls, 'r', encoding='utf-8') as f:
                for line in f:
                    url = line.strip()
                    if url not in urls_to_delete:
                        tmp.write(line)
                        tmp.write('\n')

                        
            tmp_path = tmp.name
        
        # Atomic replace
        shutil.move(tmp_path, new_urls)
        print(f"Successfully deleted {len(urls_to_delete)} URLs from {new_urls}.")
    except FileNotFoundError:
        print(f"File {new_urls} not found.")
    except Exception as e:
        print(f"An error occurred while deleting URLs: {e}")


### to be added the number of urls - only take in the ones that was asked multiple times?

# contains urls that need to be scraped
new_urls = 'data/urls/websearched_urls.txt'

# processed_urls that have been scraped and saved go here
file_url = 'data/urls/links.txt'
#  Filename: example.com_page1.txt
SCRAPED_DIR = 'data/scraped'

# Split the content into a list of URLs and filter out empty lines
# Read all URLs from the input file
with open(new_urls, 'r') as file:
    all_urls = [url.strip() for url in file.readlines() if url.strip()]

# Read already processed URLs
try:
    with open(file_url, 'r') as file:
        processed_urls = set(url.strip() for url in file.readlines())
except FileNotFoundError:
    processed_urls = set()

# Filter out already processed URLs
urls_to_process = [url for url in all_urls if url not in processed_urls]
successful_urls = []

def process_urls(urls_to_process, test=False):
    for url in urls_to_process:
        filepath = scrape_save(url, test=test)
        if filepath:
            successful_urls.append(url)
            with open(file_url, 'a') as file:
                file.write(url + '\n')
            print(f"Successfully scraped {url} and saved to {filepath}")
        else:
            print(f"Failed to scrape {url}")

    if successful_urls:
        delete_from_newurls(successful_urls)
        print(f"Successfully scraped {len(successful_urls)} URLs.")

if __name__ == "__main__":
    #testing method
    #urls_to_process = ["https://www.keysdermatology.com/clinical-dermatology/cryosurgery/"]
    print(process_urls(urls_to_process, test=False))

    