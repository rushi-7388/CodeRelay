import { useState, useRef, useEffect } from "react";
import { MessageSquareIcon, VideoIcon, VideoOffIcon, MicIcon, MicOffIcon, PhoneOffIcon, Heart, Smile, ImageIcon, Send, CornerUpLeft, MoreVertical, Camera } from "lucide-react";
import toast from "react-hot-toast";

// Helper component to render a stream
const VideoPlayer = ({ stream, isLocal, name }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-base-300 rounded-xl overflow-hidden aspect-video shadow-sm border border-base-200 group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to avoid echo
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocal ? "scale-x-[-1]" : ""}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <div className="text-white text-xs font-semibold drop-shadow-md">
          {name || (isLocal ? "You" : "Participant")}
        </div>
      </div>
    </div>
  );
};

export default function VideoCallUI({
  localStream,
  remoteStreams,
  messages,
  sendMessage,
  curUser,
  roomUsers,
  toggleVideo: parentToggleVideo,
  toggleAudio: parentToggleAudio
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  // Instagram features state
  const [likedMessages, setLikedMessages] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen, likedMessages]);

  const toggleVideo = () => {
    parentToggleVideo();
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) setIsVideoOn(track.enabled);
    }
  };

  const toggleAudio = () => {
    parentToggleAudio();
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) setIsAudioOn(track.enabled);
    }
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    // If replying, prefix message
    let finalizedMessage = chatInput.trim();
    if (replyingTo) {
      finalizedMessage = `[Replying to ${replyingTo.userName}]:\n${finalizedMessage}`;
      setReplyingTo(null);
    }

    sendMessage(finalizedMessage);
    setChatInput("");
  };

  const handleSendHeart = () => {
    sendMessage("❤️");
  };

  const toggleHeart = (msgIndex) => {
    setLikedMessages(prev => ({ ...prev, [msgIndex]: !prev[msgIndex] }));
  };

  const activeParticipantsCount = 1 + (remoteStreams?.size || 0);

  return (
    <div className="h-full flex gap-3 relative overflow-hidden bg-base-200 rounded-xl border border-base-300">
      {/* VIDEO CALL SECTION */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 bg-base-100 px-4 py-2 rounded-3xl shadow-sm border border-base-200">
            <div className="p-2 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl shadow-inner">
              <VideoIcon className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <h2 className="font-bold text-base-content tracking-tight">Session Call</h2>
              <p className="text-xs text-base-content/60 font-medium tracking-wide">{activeParticipantsCount} participant{activeParticipantsCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`btn btn-sm rounded-full px-5 transition-all shadow-sm border-0 ${isChatOpen ? "bg-base-300 text-base-content hover:bg-base-300/80" : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white hover:scale-105"}`}
          >
            <MessageSquareIcon className="w-4 h-4" />
            <span className="hidden md:inline font-bold tracking-wide">DM Chat</span>
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar pb-20">
          <div className={`grid gap-4 ${activeParticipantsCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Local Video */}
            <VideoPlayer stream={localStream} isLocal={true} name={`${curUser?.fullName || curUser?.username} (You)`} />

            {/* Remote Videos */}
            {Array.from(remoteStreams?.entries() || []).map(([userId, stream]) => {
              const participant = roomUsers?.find(u => u.userId === userId);
              return (
                <VideoPlayer
                  key={userId}
                  stream={stream}
                  isLocal={false}
                  name={participant?.userName || "Remote"}
                />
              );
            })}
          </div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-base-100/80 backdrop-blur-xl rounded-full shadow-2xl px-6 py-4 flex gap-6 border border-white/10 items-center justify-center min-w-[280px]">
          <button
            onClick={toggleAudio}
            className={`btn btn-circle btn-md border-0 text-white transition-all hover:scale-110 active:scale-95 ${isAudioOn ? "bg-base-content/20 hover:bg-base-content/30" : "bg-error hover:bg-error/90"}`}
          >
            {isAudioOn ? <MicIcon className="size-6" /> : <MicOffIcon className="size-6" />}
          </button>
          <button
            className="btn btn-error btn-circle btn-lg border-0 shadow-lg shadow-error/30 hover:scale-110 active:scale-95 transition-all mx-2"
            onClick={() => toast.error("Please use End Session in Top Navigation window.")}
          >
            <PhoneOffIcon className="size-8 text-white fill-white/20" />
          </button>
          <button
            onClick={toggleVideo}
            className={`btn btn-circle btn-md border-0 text-white transition-all hover:scale-110 active:scale-95 ${isVideoOn ? "bg-base-content/20 hover:bg-base-content/30" : "bg-error hover:bg-error/90"}`}
          >
            {isVideoOn ? <VideoIcon className="size-6" /> : <VideoOffIcon className="size-6" />}
          </button>
        </div>
      </div>

      {/* INSTAGRAM STYLE CHAT PANEL */}
      <div
        className={`bg-base-100 border-l border-base-300 transition-all duration-300 flex flex-col relative rounded-r-xl
          ${isChatOpen ? "w-[360px] opacity-100" : "w-0 opacity-0 overflow-hidden border-none"}`}
      >
        {/* Instagram Header */}
        <div className="p-4 flex justify-between items-center shadow-sm z-10 bg-base-100">
          <div className="flex items-center gap-3">
            <div className="avatar indicator cursor-pointer hover:scale-105 transition-transform">
              <span className="indicator-item badge badge-success badge-xs right-1 bottom-1"></span>
              <div className="w-11 rounded-full ring-2 ring-transparent bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full border-2 border-base-100 bg-base-100 overflow-hidden">
                  <img crossOrigin="anonymous" src={`https://api.dicebear.com/7.x/initials/svg?seed=Session`} alt="Group" className="object-cover" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-tight flex items-center gap-1.5 tracking-tight cursor-pointer hover:underline">
                Session Group <span className="text-[10px] bg-base-200 px-1.5 py-0.5 rounded-sm font-semibold tracking-wide border border-base-300">DM</span>
              </h3>
              <p className="text-[11px] text-base-content/60 font-medium mt-0.5">Active now • {activeParticipantsCount} {activeParticipantsCount === 1 ? 'member' : 'members'}</p>
            </div>
          </div>
          <div className="flex gap-4 text-base-content/90">
            <VideoIcon className="size-6 cursor-pointer hover:text-primary transition-colors" strokeWidth={1.5} onClick={() => toast("You are already in a call!")} />
            <PhoneOffIcon className="size-6 cursor-pointer hover:text-error transition-colors" onClick={() => setIsChatOpen(false)} strokeWidth={1.5} />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-base-100 relative">

          <div className="text-center text-[10px] text-base-content/40 font-bold tracking-wider mb-6 mt-2 uppercase">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-base-content/50 px-6 text-center -mt-10">
              <div className="w-24 h-24 rounded-full border-2 border-base-300 flex items-center justify-center mb-5 hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById("chat-input-field")?.focus()}>
                <MessageSquareIcon className="size-10 text-base-content/40" strokeWidth={1.2} />
              </div>
              <p className="font-bold text-lg text-base-content tracking-tight mb-1.5">Direct Messages</p>
              <p className="text-sm font-medium leading-relaxed max-w-[200px]">Send private photos and messages to a friend or group.</p>
              <button className="btn btn-primary rounded-full px-6 min-h-0 h-10 mt-6 font-bold tracking-wide" onClick={() => document.getElementById("chat-input-field")?.focus()}>Send message</button>
            </div>
          ) : (
            messages.map((msg, i) => {
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const isGrouped = prevMsg && prevMsg.userId === msg.userId && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 60000);
              const isMe = msg.userId === curUser?.id || msg.userId === null;

              // Local Reply Parsing
              const isReply = msg.message.startsWith("[Replying to ");
              let replyText = "";
              let mainText = msg.message;
              if (isReply) {
                const splitMsg = msg.message.split("]:\n");
                if (splitMsg.length > 1) {
                  replyText = splitMsg[0] + "]";
                  mainText = splitMsg[1];
                }
              }
              const isHeartOnly = mainText === "❤️" || mainText === "❤️ ";

              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative z-10 w-full animate-fade-in ${isGrouped ? '-mt-4' : ''}`}>

                  {/* Avatar wrapper for alignment */}
                  {!isMe && (
                    <div className="avatar self-end mr-2 shrink-0 translate-y-2">
                      {/* Only show avatar on the last message of the group */}
                      {(!messages[i + 1] || messages[i + 1].userId !== msg.userId) ? (
                        <div className="w-7 h-7 rounded-full bg-base-200">
                          <img crossOrigin="anonymous" src={msg.userImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.userName}`} alt="Avatar" />
                        </div>
                      ) : (
                        <div className="w-7 h-7"></div>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>

                    <div className={`flex items-center gap-2 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Reply Hover Action */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1.5 hover:bg-base-200 rounded-full"
                        onClick={() => setReplyingTo(msg)}
                        title="Reply"
                      >
                        <CornerUpLeft className="size-4 text-base-content/50 hover:text-base-content" />
                      </div>

                      {isHeartOnly ? (
                        <div
                          className="text-6xl drop-shadow-lg animate-bounce-slow cursor-pointer select-none py-1"
                          onDoubleClick={() => toggleHeart(i)}
                        >
                          ❤️
                          {/* Like Badge overlapping the giant heart */}
                          {likedMessages[i] && (
                            <div className="absolute -bottom-2 right-1 bg-base-100 rounded-full shadow-md text-xs border border-base-200 p-0.5 animate-scale-in">
                              ❤️
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`px-[16px] py-[10px] relative text-[15px] cursor-pointer select-text
                               ${isMe
                              ? 'bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-[22px] rounded-br-[4px]'
                              : 'bg-base-200/90 hover:bg-base-200 text-base-content rounded-[22px] rounded-bl-[4px] border border-base-300'
                            }`}
                          onDoubleClick={() => toggleHeart(i)}
                        >
                          {replyText && (
                            <div className="text-[11px] opacity-80 border-b border-current/20 pb-1.5 mb-2 font-semibold truncate max-w-[200px] flex items-center gap-1">
                              <CornerUpLeft className="size-3" /> {replyText}
                            </div>
                          )}
                          <div className="leading-[1.4] break-words whitespace-pre-wrap font-medium">
                            {mainText}
                          </div>

                          {/* Like Badge */}
                          {likedMessages[i] && (
                            <div className="absolute -bottom-3 -right-2 bg-base-100 rounded-full shadow-md text-[11px] border border-base-200 p-[3px] animate-scale-in z-20 flex items-center justify-center">
                              ❤️
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options Hover Action */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1.5 hover:bg-base-200 rounded-full" onClick={() => toast("Unsend feature mock")}>
                        <MoreVertical className="size-4 text-base-content/50 hover:text-base-content" />
                      </div>
                    </div>
                    {/* Seen/Sent status for Me */}
                    {isMe && i === messages.length - 1 && (
                      <span className="text-[10px] text-base-content/40 mt-1 mr-1 pr-[30px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity tracking-wide block">Seen ❤️</span>
                    )}
                  </div>

                </div>
              );
            })
          )}
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-base-100 border-t border-base-300/30">
          {replyingTo && (
            <div className="flex justify-between items-center bg-base-200/60 rounded-t-[20px] px-5 py-3 text-xs border border-b-0 border-base-300 mx-1 shadow-sm transition-all animate-fade-in">
              <div className="truncate text-base-content max-w-[85%] border-l-2 border-base-content/30 pl-3">
                <span className="font-bold tracking-tight">Replying to {replyingTo.userName}</span>
                <p className="truncate opacity-70 mt-0.5 font-medium">{replyingTo.message}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="btn btn-ghost btn-xs btn-circle bg-base-300 hover:bg-base-300/80 leading-none">✕</button>
            </div>
          )}

          <form
            onSubmit={handleSendChat}
            className={`flex items-center gap-2 bg-base-100 border px-2 py-1.5 shadow-sm transition-all focus-within:border-base-content/30
              ${replyingTo ? 'rounded-b-[24px] rounded-t-none border-t-0 border-base-300 border-l border-r border-b mx-1' : 'rounded-full border-base-300'}`}
          >
            <div className="bg-primary hover:bg-primary/90 transition-colors p-[7px] rounded-full cursor-pointer shrink-0 ml-1" onClick={() => toast("Camera opening...")}>
              <Camera className="size-[22px] text-primary-content stroke-[2]" />
            </div>

            <input
              id="chat-input-field"
              type="text"
              className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[15px] font-medium w-full px-2 py-1.5 placeholder-base-content/40"
              placeholder="Message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              autoComplete="off"
            />

            {!chatInput.trim() ? (
              <div className="flex items-center gap-3.5 text-base-content/80 shrink-0 mr-3">
                <MicIcon className="size-[22px] cursor-pointer hover:text-base-content transition-colors hover:scale-110 active:scale-95 stroke-[1.5]" onClick={() => toast("Voice note mode")} />
                <ImageIcon className="size-[22px] cursor-pointer hover:text-base-content transition-colors hover:scale-110 active:scale-95 stroke-[1.5]" onClick={() => toast("Opening gallery")} />
                <Heart className="size-6 cursor-pointer text-[#ff3040] hover:scale-110 active:scale-95 transition-transform stroke-[1.5]" onClick={handleSendHeart} />
              </div>
            ) : (
              <button type="submit" className="text-primary font-bold text-[15px] tracking-wide shrink-0 mr-4 hover:opacity-70 transition-opacity active:scale-95">
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
