import { wordCounter } from "./libs/index";
import { api } from "./services/api";

chrome?.tabs?.onUpdated.addListener(async (tabId, info) => {
  if (!info.url || info.url.slice(0, 4) !== "http") return;
  try {
    const datetimeVisited = new Date().toISOString();
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const linkCount = document.body.querySelectorAll("a[href]").length;
        const imageCount = document.body.querySelectorAll("img").length;

        const getVisibleText = (element: Element): string => {
          let visibleText = "";
          const stack: Element[] = [element];

          // we use a stack to traverse the DOM tree and flatten the tree
          while (stack.length > 0) {
            const currentElement = stack.pop();
            if (!currentElement) continue;

            // if we find a text node, we add it to the visible text with a space to seperate the lines
            if (currentElement.nodeType === Node.TEXT_NODE) {
              visibleText += ` ${currentElement.textContent || ""}`;
              continue;
            }

            if (currentElement.nodeType === Node.ELEMENT_NODE) {
              const style = window.getComputedStyle(currentElement as Element);

              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
              ) {
                continue;
              }

              // flatten the node and add it to the stack
              stack.push(
                ...(Array.from(currentElement.childNodes) as Element[])
              );
            }
          }

          return visibleText;
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
