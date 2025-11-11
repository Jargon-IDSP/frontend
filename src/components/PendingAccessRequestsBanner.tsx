interface PendingRequest {
  quizId: string;
  quizName: string;
}

interface PendingAccessRequestsBannerProps {
  requesterName: string;
  requests: PendingRequest[];
  onApprove: (quizId: string) => void;
  onDeny: (quizId: string) => void;
  isApproving: boolean;
  isDenying: boolean;
}

/**
 * Banner component displaying pending quiz access requests
 * Shows list of lessons a user has requested access to with approve/deny actions
 */
export default function PendingAccessRequestsBanner({
  requesterName,
  requests,
  onApprove,
  onDeny,
  isApproving,
  isDenying,
}: PendingAccessRequestsBannerProps) {
  if (requests.length === 0) return null;

  return (
    <div className="friend-profile-pending-requests-banner">
      <h3 className="friend-profile-pending-requests-title">
        Pending Access Requests
      </h3>
      <p className="friend-profile-pending-requests-message">
        {requesterName} has requested access to the following lessons:
      </p>
      <div className="friend-profile-pending-requests-list">
        {requests.map((request) => (
          <div
            key={request.quizId}
            className="friend-profile-pending-request-item"
          >
            <span className="friend-profile-pending-request-name">
              {request.quizName}
            </span>
            <div className="friend-profile-pending-request-actions">
              <button
                onClick={() => onApprove(request.quizId)}
                disabled={isApproving || isDenying}
                className="friend-profile-request-button friend-profile-request-button--approve"
              >
                {isApproving ? "..." : "Approve"}
              </button>
              <button
                onClick={() => onDeny(request.quizId)}
                disabled={isApproving || isDenying}
                className="friend-profile-request-button friend-profile-request-button--deny"
              >
                {isDenying ? "..." : "Deny"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
