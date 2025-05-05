import Header from '@/components/Header';
import ChatWindow from '@/components/ChatWindow';

const Home = () => {
  return (
    <div className="mt-16 mb-[182px] grid grid-cols-1 bg-white">
      <Header />
      <ChatWindow />
    </div>
  );
};

export default Home;
