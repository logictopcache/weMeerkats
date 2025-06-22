const UnderDevelopmentModal = () => {
    return (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <svg
            className="w-32 h-32 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L3 20H21L12 4Z"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16V17"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 9V14"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Under Development</h2>
          <p className="text-gray-600">
            We apologize, but this module is currently under development. Please check back later.
          </p>
        </div>
      </div>
    );
  };
  
  export default UnderDevelopmentModal;