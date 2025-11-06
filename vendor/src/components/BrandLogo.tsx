import logo from '@/assets/logo.jpg';

const BrandLogo = () => {
  return (
    <div className="fixed top-6 right-6 z-50 opacity-30 hover:opacity-50 transition-all duration-300">
      <div className="relative">
        <img 
          src={logo} 
          alt="Smartshake Vending" 
          className="w-24 h-24 object-contain blur-[0.5px] drop-shadow-lg"
          style={{
            filter: 'blur(0.5px) drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default BrandLogo;
