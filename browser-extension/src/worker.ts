import { wordCounter } from "./libs/index";
import { api } from "./services/api";

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (!info.url || info.url.slice(0, 9) === "chrome://") return;
  try {
    const datetimeVisited = new Date().toISOString();
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const linkCount = document.body.querySelectorAll("a[href]").length;
        const imageCount = document.body.querySelectorAll("img").length;

        // Function to get visible text content
        const getVisibleText = (element: Element): string => {
          if (element.nodeType === Node.TEXT_NODE) {
            return element.textContent || "";
          }
          try {
            const style = window.getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            ) {
              return "";
            }

            let text = "";

            for (const child of Array.from(element.childNodes)) {
              text += getVisibleText(child as Element);
            }
            return text;
          } catch (error) {
            console.log(error, typeof element, element, element.nodeType);
            return "";
          }
        };

        const visibleText = getVisibleText(document.body);

        return {
          linkCount,
          imageCount,
          characterCount: visibleText.length,
          visibleText,
        };
      },
    });

    if (response.result) {
      const { visibleText, ...data } = response.result;

      const request = {
        ...data,
        datetimeVisited,
        url: info.url,
        wordCount: wordCounter(visibleText).totalWords,
      };

      await api.createPageVisit(request);
      chrome.runtime.sendMessage({
        type: "GET_PAGE_VISITS",
      });
    } else {
      throw Error("an error while get metric from webpage");
    }
  } catch (error) {
    console.debug({ error, info, tabId });
  }
});
