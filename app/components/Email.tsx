// Email.tsx

import React from "react";

interface EmailProps {
  subject: string;
  body: string;
}

const Email: React.FC<EmailProps> = ({ subject, body }) => {
  const formatBody = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="email-container p-4 w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Email Preview
      </h1>
      <div className="subject-box mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Subject
        </label>
        <div className="p-2 border border-gray-300 rounded bg-gray-100">
          <h2 className="email-subject font-bold text-lg text-gray-800">
            {subject}
          </h2>
        </div>
      </div>
      <div className="email-body text-gray-800 bg-gray-50 p-2 border border-gray-300 rounded">
        {formatBody(body)}
      </div>
    </div>
  );
};

export default Email;
