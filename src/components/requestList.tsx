import React from "react";

interface RequestListProps {
  title: string;
  requests: string[];
  idPrefix: string;
}

export const RequestList: React.FC<RequestListProps> = ({ title, requests, idPrefix }) => {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-medium mb-2">{title}</h4>
      <div className="space-y-2">
        {requests.map((url, index) => (
          <div
            key={index}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <p
              className="text-slate-700 dark:text-slate-300 text-sm break-words"
              style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
            >
              {url.length > 30 ? (
                <>
                  {url.slice(0, 30)}...
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const fullUrlElement = document.getElementById(`${idPrefix}-${index}`);
                      if (fullUrlElement) {
                        fullUrlElement.style.display =
                          fullUrlElement.style.display === "none" ? "block" : "none";
                      }
                    }}
                    className="text-blue-500 hover:underline ml-2 cursor-pointer"
                  >
                    Show More
                  </button>
                  <span
                    id={`${idPrefix}-${index}`}
                    style={{ display: "none" }}
                    className="block mt-2"
                  >
                    {url}
                  </span>
                </>
              ) : (
                url
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};