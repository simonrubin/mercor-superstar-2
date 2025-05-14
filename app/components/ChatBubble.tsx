import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { faFaceLaugh } from "@fortawesome/free-solid-svg-icons";

import Email from "./Email";
import Businesses from "./Businesses";
import HeatMap from "./heatmap/HeatMap";

import Markdown from "react-markdown";
import { Business } from "./MapPopup";
import Image from "next/image";

interface ChatBubbleProps {
  role: string;
  content: any;
  type?: string;
  onHighlightBusiness?: (business?: Business) => void;
}

export default function ChatBubble({
  role,
  content,
  type = "message",
  onHighlightBusiness,
}: ChatBubbleProps) {
  let bubbleClass = "";
  let bubbleContent;
  let profile = (
    <div className="flex flex-shrink-0 items-center justify-center bg-green-500 rounded w-[36px] h-[36px]">
      <FontAwesomeIcon icon={faFaceLaugh} className="text-white text-xl" />
    </div>
  );

  if (role === "assistant") {
    bubbleClass = "bg-container rounded-lg";
    profile = (
      <div className="flex flex-shrink-0 items-center justify-center bg-primary rounded w-[36px] h-[36px]">
        <FontAwesomeIcon icon={faRobot} className="text-white text-xl" />
      </div>
    );
  }

  if (type === "thinking") {
    bubbleContent = (
      <div className="flex items-center">
        <span className="thinking"></span>
      </div>
    );
  } else if (content[0].type === "spreadsheet") {
    const openInNewTab = (url: string) => {
      window.open(url, "_blank", "noreferrer");
    };
    bubbleContent = (
      <div className="flex flex-col w-full gap-4">
        <div>Sure, here&apos;s the spreadsheet</div>
        <div
          className="flex flex-col items-center cursor-pointer hover:underline"
          onClick={() => openInNewTab(content[0].spreadsheet.url)}
        >
          <Image
            src="/google_sheets_icon.png"
            alt="google sheets"
            width={80}
            height={80}
          />
          <div className="font-bold text-gray-500">
            {content[0].spreadsheet.title}
          </div>
        </div>
      </div>
    );
  } else if (content[0].type === "email") {
    bubbleContent = (
      <Email subject={content[0].email.subject} body={content[0].email.body} />
    );
  } else if (content[0].type === "businesses") {
    bubbleContent = (
      <Businesses
        message={content[0].text?.value}
        businesses={content[0].businesses}
        onSelect={onHighlightBusiness!}
      />
    );
  } else if (content[0].type === "traffic") {
    bubbleContent = (
      <div className="flex flex-col w-full gap-4">
        <div>{content[0].text?.value}</div>
        <HeatMap {...content[0].traffic} />
      </div>
    );
  } else {
    bubbleContent = (
      <div className="whitespace-pre-wrap py-1">
        <Markdown>{content[0].text?.value}</Markdown>
      </div>
    );
  }

  return (
    <div className={`chat-bubble p-4 ${bubbleClass}`}>
      <div className="flex gap-4">
        {profile}
        {bubbleContent}
      </div>
    </div>
  );
}
