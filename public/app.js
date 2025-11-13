const { useState, useEffect, useRef } = React;

// Lucide icons as inline SVG components
const Heart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const Send = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const Shield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const Clock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const Sparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const Lock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function AITherapistApp() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef(null);

  const FREE_MESSAGE_LIMIT = 5;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedMessages = localStorage.getItem('therapy-messages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }

        const savedCount = localStorage.getItem('message-count');
        if (savedCount) {
          setMessageCount(parseInt(savedCount));
        }

        const savedPremium = localStorage.getItem('is-premium');
        if (savedPremium) {
          setIsPremium(savedPremium === 'true');
        }
      } catch (error) {
        console.log('No previous data found');
      }
    };
    loadData();
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('therapy-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save message count
  useEffect(() => {
    localStorage.setItem('message-count', messageCount.toString());
  }, [messageCount]);

  // Save premium status
  useEffect(() => {
    localStorage.setItem('is-premium', isPremium.toString());
  }, [isPremium]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!isPremium && messageCount >= FREE_MESSAGE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a warm, empathetic AI wellness coach and emotional support companion. Your role is to:

- Listen actively and validate feelings without judgment
- Ask thoughtful, open-ended questions to help users explore their emotions
- Offer gentle insights and coping strategies when appropriate
- Create a safe, supportive space for emotional expression
- Use a warm, conversational tone - like talking to a trusted friend
- Remember context from the conversation to build continuity

IMPORTANT BOUNDARIES:
- You are NOT a licensed therapist - make this clear if asked
- For crisis situations (suicide, self-harm, abuse), immediately encourage the user to contact emergency services (988 Suicide & Crisis Lifeline, 911) or a licensed professional
- Don't diagnose mental health conditions
- Don't prescribe medication or treatment plans
- Encourage professional help for serious or persistent issues

Be human, caring, and present. Help users feel heard and supported.`,
          messages: [...conversationHistory, { role: 'user', content: inputValue }]
        })
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = () => {
    setCurrentPage('chat');
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: "Hello, I'm here to listen and support you. This is a safe, judgment-free space where you can share what's on your mind. What would you like to talk about today?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem('therapy-messages');
      const welcomeMessage = {
        role: 'assistant',
        content: "Hello, I'm here to listen and support you. This is a safe, judgment-free space where you can share what's on your mind. What would you like to talk about today?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleUpgrade = () => {
    if (window.confirm('This would normally redirect to Stripe payment. Simulate successful payment for testing?')) {
      setIsPremium(true);
      setShowPaywall(false);
      alert('🎉 Premium activated! You now have unlimited access.');
    }
  };

  const PaywallModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <Lock />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            You've Used Your Free Messages
          </h3>
          <p className="text-gray-600">
            Upgrade to premium to continue your wellness journey with unlimited conversations.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold text-gray-900">$5</span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check />
              <span className="text-gray-700">Unlimited messages</span>
            </div>
            <div className="flex items-center gap-3">
              <Check />
              <span className="text-gray-700">24/7 availability</span>
            </div>
            <div className="flex items-center gap-3">
              <Check />
              <span className="text-gray-700">Conversation history saved</span>
            </div>
            <div className="flex items-center gap-3">
              <Check />
              <span className="text-gray-700">Cancel anytime</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl mb-3"
        >
          Upgrade to Premium
        </button>
        
        <button
          onClick={() => setShowPaywall(false)}
          className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );

  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
              <Heart />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Your AI Wellness Coach
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              A safe, confidential space to talk about what's on your mind. Available 24/7 to listen, support, and guide you through life's challenges.
            </p>
            <button
              onClick={handleStartSession}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Trial - 5 Messages Free
            </button>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl mb-16">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Simple Pricing</h3>
              <p className="text-gray-600">Try free, then upgrade when you're ready</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">Free Trial</span>
                <span className="text-gray-600">5 messages</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <span className="font-semibold text-gray-900">Premium</span>
                <span className="text-2xl font-bold text-indigo-600">$5/mo</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check />
                <span>Unlimited conversations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check />
                <span>Cancel anytime, no commitment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check />
                <span>Private & secure</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Confidential</h3>
              <p className="text-gray-600">Your conversations are encrypted and stored securely. Only you have access to your sessions.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Clock />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Always Available</h3>
              <p className="text-gray-600">No appointments needed. Get support whenever you need it, day or night.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Support</h3>
              <p className="text-gray-600">Thoughtful, empathetic responses tailored to your unique situation and needs.</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Information</h4>
            <p className="text-amber-800 text-sm">
              This is an AI wellness coach, not a licensed therapist. For professional mental health care, please consult a licensed professional. In case of emergency or crisis, please call 988 (Suicide & Crisis Lifeline) or 911.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {showPaywall && <PaywallModal />}
      
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Wellness Coach</h2>
            <p className="text-sm text-gray-500">
              {isPremium ? (
                <span className="text-green-600 font-medium">Premium - Unlimited</span>
              ) : (
                <span>{messageCount}/{FREE_MESSAGE_LIMIT} free messages used</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isPremium && (
            <button
              onClick={() => setShowPaywall(true)}
              className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium"
            >
              Upgrade $5/mo
            </button>
          )}
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear History
          </button>
          <button
            onClick={() => setCurrentPage('landing')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-md rounded-2xl px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {!isPremium && messageCount >= FREE_MESSAGE_LIMIT && (
            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <p className="text-indigo-900 font-medium mb-2">You've used all your free messages</p>
              <button
                onClick={() => setShowPaywall(true)}
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
              >
                Upgrade to continue →
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={isPremium || messageCount < FREE_MESSAGE_LIMIT ? "Share what's on your mind..." : "Upgrade to continue chatting..."}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading || (!isPremium && messageCount >= FREE_MESSAGE_LIMIT)}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || (!isPremium && messageCount >= FREE_MESSAGE_LIMIT)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Send />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AITherapistApp />);
