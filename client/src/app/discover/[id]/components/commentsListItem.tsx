import Typography from '@mui/material/Typography';

import Avatar from 'components/avatar';

import styles from '../styles/commentsListItem.module.scss';

interface CommentsListItemProps {
  user: {
    username: string;
    profilePic: string;
  };
  content: string;
}
function CommentsListItem({ user, content }: CommentsListItemProps) {
  return (
    <li className={styles['comments__list-item']}>
      <Avatar
        src={
          user.profilePic
            ? `data:image/webp;base64,${user.profilePic}`
            : undefined
        }
      />
      <div className={styles['text__container']}>
        <Typography className={styles['comments__label']} variant="bodyLarge">
          {user.username}
        </Typography>
        <Typography
          className={styles['comments__support']}
          variant="bodyMedium"
        >
          {content}
        </Typography>
      </div>
    </li>
  );
}

export default CommentsListItem;
