import { useState, useEffect, useRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface CorrectToastProps {
  visible: boolean;
  onClose: () => void;
}

export default function CorrectToast({ visible, onClose }: CorrectToastProps) {
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'exiting'>('hidden');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 处理显示状态变化
  useEffect(() => {
    if (visible) {
      // 显示弹框
      setAnimationState('entering');
      
      // 1秒后自动关闭
      timerRef.current = setTimeout(() => {
        setAnimationState('exiting');
        setTimeout(() => {
          onClose();
        }, 300); // 等待退出动画完成
      }, 1000);
    } else {
      // 清除计时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setAnimationState('hidden');
    }

    // 组件卸载时清除计时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, onClose]);

  // 动画样式映射
  const animationClasses = {
    hidden: 'opacity-0 pointer-events-none',
    entering: 'animate-slideIn opacity-100 pointer-events-auto',
    exiting: 'animate-fadeOut opacity-0'
  };

  return (
    <div 
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 z-50 transition-all duration-300 ${animationClasses[animationState]}`}
    >
      <FaCheckCircle className="text-xl" />
      <span className="font-medium text-lg">答对</span>
    </div>
  );
}
    