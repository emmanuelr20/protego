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
          const visibleText: string[] = [];

          // Create a TreeWalker to traverse text nodes in the DOM
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                const parent = node.parentElement;
                if (parent) {
                  // Get computed styles of the parent to determine visibility
                  const style = window.getComputedStyle(parent);
                  if (
                    style.display === "none" ||
                    style.visibility === "hidden" ||
                    parseFloat(style.opacity) === 0
                  ) {
                    return NodeFilter.FILTER_REJECT; // Reject the node if it's not visible
                  }
                }
                return NodeFilter.FILTER_ACCEPT; // Accept the node if it's visible
              },
            }
          );

          let currentNode: Node | null;

          // Iterate through visible text nodes
          while ((currentNode = walker.nextNode())) {
            visibleText.push(currentNode.textContent || "");
          }

          // Join and return all visible text as a single string
          return visibleText.join(" ");
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
