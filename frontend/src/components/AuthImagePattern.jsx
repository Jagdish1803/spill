const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-black p-12 min-h-screen">
      <div className="max-w-4xl text-center space-y-8">
        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-4">
              {[0, 1, 2].map((row) => {
                const index = col * 3 + row;
                return (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-xl bg-blue-700 ${
                      index % 2 === 0 ? "animate-pulse" : ""
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-5 text-white">{title}</h2>
          <p className="text-white">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;