import React from "react";

const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    let content
    switch (comment.status) {
      case 'rejected':
        content = "This comment has been rejected"
        break;
      case 'pending':
        content = "This comment is awaiting moderation"
        break;
      default:
        content = comment.content
        break;
    }

    return <li key={comment.id}>{content}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
