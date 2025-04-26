import { useEffect, useState } from "react";
import { PageVisit } from "./types";
import { useTabMonitor } from "./hooks/useTabMonitor";
import { formatDate } from "./libs";
import { api } from "./services/api";
import Card from "./components/Card";

const PAGE_LIMIT = 10;

function App() {
  const [offset, setOffset] = useState(0);
  const [totalVisit, setTotalVisit] = useState(0);
  const [pageVisit, setPageVisit] = useState<PageVisit>();
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTabId, currentUrl } = useTabMonitor();

  const cleanUp = () => {
    setOffset(0);
    setTotalVisit(0);
    setPageVisit(undefined);
    setPageVisits([]);
    setError(null);
  };

  const loadMorePageVisits = async () => {
    if (currentUrl) {
      try {
        setIsLoadingMore(true);
        setError(null);
        setOffset(offset + PAGE_LIMIT);
        const result = await api.getPageVisits(currentUrl, offset, PAGE_LIMIT);

        if (result) {
          setPageVisits([...pageVisits, ...result.page_visits]);
          setTotalVisit(result.total);
        } else {
          setOffset(offset - PAGE_LIMIT);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setError("Failed to load more history items");
        setOffset(offset - PAGE_LIMIT);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const initData = async () => {
      if (currentUrl) {
        try {
          setIsLoading(true);
          setError(null);
          const result = await api.getPageVisits(currentUrl, 0, PAGE_LIMIT);

          if (result) {
            setPageVisit(result.page_visits[0]);
            setPageVisits(result.page_visits);
            setTotalVisit(result.total);
            setOffset(0);
          }
        } catch (error) {
          console.error("Failed to fetch metrics:", error);
          setError("Failed to load page history");
        } finally {
          setIsLoading(false);
        }
      }
    };

    const listener = (message: { type: string }) => {
      {
        if (message.type === "GET_PAGE_VISITS") {
          initData();
        }
      }
    };

    chrome?.runtime?.onMessage.addListener(listener);
    initData();
    return () => {
      cleanUp();
      chrome?.runtime?.onMessage.removeListener(listener);
    };
  }, [currentTabId, currentUrl]);

  if (isLoading) {
    return (
      <>
        <h1>History Sidepanel</h1>
        <div className="loading-spinner">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1>History Sidepanel</h1>
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </>
    );
  }

  return (
    <>
      <h1>History Sidepanel</h1>

      {pageVisit && pageVisits ? (
        <>
          <h3>Page Info</h3>
          <Card title="Page URL" value={pageVisit.url} />
          <Card title="Total Page Visits" value={totalVisit} />
          <Card title="Total Image Count" value={pageVisit.image_count} />
          <Card title="Total Link Count" value={pageVisit.link_count} />
          <Card title="Total Word Count" value={pageVisit.word_count} />
          <Card
            title="Total Character Count"
            value={pageVisit.character_count}
          />
          <Card
            title="Last Visit Time"
            value={formatDate(pageVisit.datetime_visited)}
          />

          <h3>History</h3>
          <div className="history-wrapper">
            {pageVisits.map((pv) => (
              <Card key={pv.id} value={formatDate(pv.datetime_visited)} />
            ))}
            {offset + PAGE_LIMIT < totalVisit && (
              <button
                onClick={loadMorePageVisits}
                disabled={isLoadingMore}
                className={isLoadingMore ? "loading" : ""}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
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
