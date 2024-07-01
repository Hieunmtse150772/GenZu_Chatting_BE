User = {
    name: String,
    id: ID,
    email: String,
    friends: [],

}
FriendRequest = {
    id: ID,
    sender: UserId,
    receiver: UserId,
    status: String,

}
//trường hợp 1: 2 người cùng gửi 2 request, 1 người chấp nhận trước thì sẽ hủy request còn lại 

//Trường hợp 2: 1 người gửi request trước, người gửi request sau sẽ đổi status request của người kia thành 'accept'

//Trường hợp 3: 