import { useEffect, useState } from "react";
import { PageVisit } from "./types";
import { useTabMonitor } from "./hooks/useTabMonitor";
import { formatDate } from "./libs";
import { api } from "./services/api";

const PAGE_LIMIT = 10;

function App() {
  const [offset, setOffset] = useState(0);
  const [totalVisit, setTotalVisit] = useState(0);
  const [pageVisit, setPageVisit] = useState<PageVisit>();
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const { currentTabId, currentUrl } = useTabMonitor();

  const cleanUp = () => {
    setOffset(0);
    setTotalVisit(0);
    setPageVisit(undefined);
    setPageVisits([]);
  };

  const fetchMetric = async () => {
    if (!currentUrl) return;
    try {
      return await api.getPageVisits(currentUrl, offset, PAGE_LIMIT);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      return undefined;
    }
  };

  const initData = async () => {
    const result = await fetchMetric();

    if (result) {
      setPageVisit(result.page_visits[0]);
      setPageVisits(result.page_visits);
      setTotalVisit(result.total);
      setOffset(0);
    }
  };

  const loadMorePageVisits = async () => {
    setOffset(offset + PAGE_LIMIT);
    const result = await fetchMetric();

    if (result) {
      setPageVisits([...pageVisits, ...result.page_visits]);
      setTotalVisit(result.total);
    } else {
      setOffset(offset - PAGE_LIMIT);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (message: any) => {
      {
        if (message.type === "GET_PAGE_VISITS") {
          initData();
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    initData();
    return () => {
      cleanUp();
      chrome.runtime.onMessage.removeListener(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTabId, currentUrl]);

  return (
    <>
      <h1>History Sidepanel</h1>

      {pageVisit && pageVisits ? (
        <>
          <h3>Page Info</h3>
          <div className="card">
            <label>url</label>
            <p>{pageVisit.url}</p>
          </div>
          <div className="card">
            <label>Total Page Visits</label>
            <p>{totalVisit}</p>
          </div>
          <div className="card">
            <label>Total Image Count</label>
            <p>{pageVisit.image_count}</p>
          </div>
          <div className="card">
            <label>Total Link Count</label>
            <p>{pageVisit.link_count}</p>
          </div>
          <div className="card">
            <label>Total Word Count</label>
            <p>{pageVisit.word_count}</p>
          </div>
          <div className="card">
            <label>Total Character Count</label>
            <p>{pageVisit.character_count}</p>
          </div>
          <div className="card">
            <label>Last Visit Time</label>
            <p>{formatDate(pageVisit.datetime_visited)}</p>
          </div>

          <h3>History</h3>
          <div className="history-wrapper">
            {pageVisits.map((pv) => (
              <div className="card" key={pv.id}>
                <p>{formatDate(pv.datetime_visited)}</p>
              </div>
            ))}
            {offset + PAGE_LIMIT < totalVisit && (
              <button onClick={loadMorePageVisits}>Load More</button>
            )}
          </div>
        </>
      ) : (
        <>
          <h4>No PageVisit Available for this page</h4>
        </>
      )}
    </>
  );
}

export default App;
