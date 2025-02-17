import { FaExternalLinkAlt } from 'react-icons/fa';

interface ExternalLinkIconProps {
  className?: string; // className is optional
}

const ExternalLinkIcon: React.FC<ExternalLinkIconProps> = ({ className }) => {
  return <FaExternalLinkAlt className={className} />;
};

export default ExternalLinkIcon;