export const messageSchema = {
  id: String,
  senderId: String,
  receiverId: String,
  text: String,
  time: String,
  status: 'sent' | 'delivered' | 'read',
  attachments: Array
};

export const mentorMessagesData = {
  currentUser: {
    id: 'mentor1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: '/mentor1.jpg'
  },
  conversations: [
    {
      id: 1,
      user: {
        id: 'mentee1',
        name: 'Sarah Wilson',
        image: '/mentee1.jpg',
        status: 'online'
      },
      lastMessage: 'Thanks for the help!',
      time: '2m',
      unread: 0,
      messages: [
        {
          id: 1,
          senderId: 'mentee1',
          text: 'Hi, I need help with React',
          time: '2:30 PM',
          status: 'read'
        },
        {
          id: 2,
          senderId: 'mentor',
          text: 'Sure, what specific issue are you facing?',
          time: '2:31 PM',
          status: 'read'
        }
      ]
    }
  ]
};
