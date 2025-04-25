import { useEffect, useState } from "react";

export const useTabMonitor = (): {
  currentUrl?: string;
  currentTabId?: number;
} => {
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [currentTabId, setCurrentTabId] = useState<number>();

  useEffect(() => {
    // Get initial active tab
    const initActiveTab = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        setCurrentTabId(tab.id);
        setCurrentUrl(tab.url);
      }
    };
    initActiveTab();

    // Tab switched listener
    const onTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      setCurrentTabId(activeInfo.tabId);
      const tab = await chrome.tabs.get(activeInfo.tabId);
      setCurrentUrl(tab.url);
    };

    // URL changed listener
    const onTabUpdated = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) => {
      if (tabId === currentTabId && changeInfo.url) {
        setCurrentUrl(changeInfo.url);
      }
    };

    // Set up listeners
    chrome?.tabs?.onActivated.addListener(onTabActivated);
    chrome?.tabs?.onUpdated.addListener(onTabUpdated);

    return () => {
      chrome?.tabs?.onActivated.removeListener(onTabActivated);
      chrome?.tabs?.onUpdated.removeListener(onTabUpdated);
    };
  }, [currentTabId]);

  return { currentUrl, currentTabId };
};
