// import React from "react";

// const imageData = {
//   provinces: [
//     {
//       name: "வடக்கு மாகாணம்",
//       districts: [
//         {
//           name: "யாழ்ப்பாணம்",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "https://live.staticflickr.com/65535/52613194496_2d3d39870c_o.png",
//             "district1_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//             "Methodist Girls' High School",
//           ],
//         },
//         {
//           name: "முல்லைத்தீவு",
//           images: [
//             "https://live.staticflickr.com/65535/52613194496_2d3d39870c_o.png",
//             "district2_image2.jpg",
//             "district2_image10.jpg",
//           ],
//         },
//         {
//           name: "மன்னார்",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district6_image2.jpg",
//             "district6_image10.jpg",
//           ],
//         },
//         {
//           name: "கிளிநொச்சி",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district7_image2.jpg",
//             "district7_image10.jpg",
//           ],
//         },
//         {
//           name: "வவுனியா",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district8_image2.jpg",
//             "district8_image10.jpg",
//           ],
//         },
//       ],
//     },
//     {
//       name: "கிழக்கு மாகாணம்",
//       districts: [
//         {
//           name: "திருகோணமலை",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district3_image2.jpg",
//             "district3_image10.jpg",
//           ],
//         },
//         {
//           name: "மட்டக்களப்பு",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district4_image2.jpg",
//             "district4_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//             "Methodist Girls' High School",
//           ],
//         },
//         {
//           name: "அம்பாறை",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district5_image2.jpg",
//             "district5_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//       ],
//     },
//     {
//       name: "மத்திய மாகாணம்",
//       districts: [
//         {
//           name: "kandy",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district9_image2.jpg",
//             "district9_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "nuwaraeliya",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district10_image2.jpg",
//             "district10_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "matale",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district11_image2.jpg",
//             "district11_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//       ],
//     },
//     {
//       name: "மேல் மாகாணம்",
//       districts: [
//         {
//           name: "colombo",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district12_image2.jpg",
//             "district12_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "gampaha",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district13_image2.jpg",
//             "district13_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "kalutara",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district14_image2.jpg",
//             "district14_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//       ],
//     },
//     {
//       name: "southern",
//       districts: [
//         {
//           name: "galle",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district15_image2.jpg",
//             "district15_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "matara",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district16_image2.jpg",
//             "district16_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//         {
//           name: "hambantota",
//           images: [
//             "https://cdn.audleytravel.com/5237/3740/79/1332748-jaffna-library.jpg",
//             "district17_image2.jpg",
//             "district17_image10.jpg",
//           ],
//           schedule: {
//             date: "2024-05-10",
//             time: "10:00 AM",
//             venue: "Jaffna Central College",
//           },
//           winning_schools: {
//             "1st_place": "Jaffna Hindu College",
//             "2nd_place": "St. John's College",
//             "3rd_place": "St. Patrick's College",
//           },
//           participated_schools: [
//             "Jaffna Hindu College",
//             "St. John's College",
//             "St. Patrick's College",
//             "Union College",
//           ],
//         },
//       ],
//     },
//   ],
// };
