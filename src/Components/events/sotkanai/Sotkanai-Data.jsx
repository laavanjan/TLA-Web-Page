import React from "react";

// import React, { useState, useEffect } from 'react';

// function SotkanaiData() {
//   const [sotkanaiData, setSotkanaiData] = useState(null);

//   useEffect(() => {
//       const fetchEvents = async () => {
//         try {
//             const response = await fetch('/api/sotkanais');

//             if (!response.ok) {
//                 throw new Error('Failed to fetch events');
//             }

//             const data = await response.json();
//             setSotkanaiData(data);
//         } catch (error) {
//             console.error('Error fetching events:', error);
//         }
//     };
//     fetchEvents();
//   }, []);
//   console.log("sotkanaiData source", sotkanaiData);
//   return sotkanaiData;
// }
// export default SotkanaiData;

const SotkanaiData = [
    {
      provinceName: "வடக்கு மாகாணம்",
      districts: [
        {
          name: "யாழ்ப்பாணம்",
          images: [
            "https://media.timeout.com/images/101839243/750/422/image.jpg",
            "https://live.staticflickr.com/65535/53617240976_68469df202_k.jpg",
            "https://live.staticflickr.com/65535/52613194496_2d3d39870c_o.png"
          ],
          schedule: {
            // date: "2024-06-10",
            // time: "மு.ப 10:00",
            // venue: "யாழ்ப்பாணம் இந்துக் கல்லூரி",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: [
            "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            "யாழ்ப்பாணம் மத்திய கல்லூரி",
            "யாழ் சம்பத்தரிசியார் கல்லூரி",
            "யாழ் பரி யோவான் கல்லூரி",
            "வேம்படி மகளிர் கல்லூரி",
            "சுண்டிக்குளி மகளிர் கல்லூரி",
            "யாழ்ப்பாணம் இந்து மகளிர் கல்லூரி",
            "யாழ் திருக்குடும்பக் கன்னியர் மடம்",
            "கொக்குவில் இந்துக் கல்லூரி",
            "யாழ் வைத்தீஸ்வர வித்தியாலயம்",
            "வண்ணார்பண்ணை நாவலர் மகாவித்தியாலயம்",
            "யாழ் கனகரத்தினம் மத்திய மகா வித்தியாலயம்"
          ],
        },
        {
          name: "முல்லைத்தீவு",
          images: [
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/502839376.jpg?k=ebc6e56089d24f4f7344a521789feb225ea0c6e72c37c527908b213cc6df3361&o=&hp=1",
            "https://live.staticflickr.com/65535/53618049798_477e5c1198_z.jpg",
            "district2_image2.jpg",
            "district2_image10.jpg",
          ],
          schedule: {
            // date: "2024-06-10",
            // time: "மு.ப 10:00",
            // venue: "யாழ்ப்பாணம் இந்துக் கல்லூரி",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: []
        },
        {
          name: "மன்னார்",
          images: [
            "https://www.srilankanexpeditions.co.uk/images/main_slider/destination/mannar/01.jpg",
            "https://live.staticflickr.com/65535/53616365332_d3dd7738f1_k.jpg",
            "district6_image2.jpg",
            "district6_image10.jpg",
          ],
          schedule: {
            // date: "2024-06-10",
            // time: "மு.ப 10:00",
            // venue: "யாழ்ப்பாணம் இந்துக் கல்லூரி",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: []
        },
        {
          name: "கிளிநொச்சி",
          images: [
            "https://upload.wikimedia.org/wikipedia/commons/c/cb/Iranamadu_Tank2.jpg",
            "https://live.staticflickr.com/65535/53616365292_4e28e734b4_b.jpg",
            "district7_image2.jpg",
            "district7_image10.jpg",
          ],
          schedule: {
            date: "2024-04-20",
            time: "மு.ப 8:00",
            venue: "கிளிநொச்சி மகா வித்தியாலயம்",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: []
        },
        {
          name: "வவுனியா",
          images: [
            "https://i0.wp.com/amazinglanka.com/wp/wp-content/uploads/2018/11/pavakkulama.jpg?ssl=1",
            "https://live.staticflickr.com/65535/53617448608_e62f14f80f_k.jpg",
            "district8_image2.jpg",
            "district8_image10.jpg",
          ],
          schedule: {
            date: "2024-04-06",
            time: "மு.ப 8:00",
            venue: "வவுனியா தமிழ் மகா வித்தியாலயம்",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: []
        },
      ],
    },
    {
      provinceName: "கிழக்கு மாகாணம்",
      districts: [
        {
          name: "திருகோணமலை",
          images: [
            "https://assets-global.website-files.com/65518ceb6b87d71f5914ab75/655ef552f4bb20e00c98f636_Places-to-visit-in-Trincomalee.jpg",
            "https://live.staticflickr.com/65535/53617575489_f8e344cad1_k.jpg",
            "district3_image2.jpg",
            "district3_image10.jpg",
          ],
          schedule: {
            // date: "2024-06-10",
            // time: "மு.ப 10:00",
            // venue: "யாழ்ப்பாணம் இந்துக் கல்லூரி",
          },
          winning_schools: {
            // "1st_place": "யாழ்ப்பாணம் இந்துக் கல்லூரி",
            // "2nd_place": "வேம்படி மகளிர் கல்லூரி",
            // "3rd_place": "கொக்குவில் இந்துக் கல்லூரி",
          },
          participated_schools: []
        },
        {
          name: "மட்டக்களப்பு",
          images: [
            "https://www.shutterstock.com/image-photo/batticaloa-eastern-province-sri-lanka-600nw-1723309015.jpg",
            "https://live.staticflickr.com/65535/53617575774_5ba06dd179_k.jpg",
            "district4_image2.jpg",
            "district4_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-20",
            // time: "11:00 AM",
            // venue: "Batticaloa Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [

          ],
        },
        {
          name: "அம்பாறை",
          images: [
            "https://mediaim.expedia.com/destination/2/76aa026d2f9e21c029cd17ed49e12feb.jpg",
            "https://live.staticflickr.com/65535/53617448848_d3db32ad37_k.jpg",
            "district5_image2.jpg",
            "district5_image10.jpg",
          ],
          schedule: {
            date: "2024-04-16",
            time: "மு.ப 8:00",
            venue: "கார்மேல் பாத்திமா கல்லூரி",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
      ],
    },
    {
      provinceName: "சப்ரகமுவ மாகாணம்",
      districts: [
        {
          name: "இரத்தினபுரி",
          images: [
            "https://archives1.sundayobserver.lk/sites/default/files/styles/large/public/news/2018/10/26/z_p52-Ratnapura-01.jpg?itok=5LPU7vCp",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [

          ],
        },
        {
          name: "கேகாலை",
          images: [
            "https://www.yovoyagin.com/uploads/0000/76/2022/04/08/the-orphanage-was-founded.jpg",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        }
      ],
    },
    {
      provinceName: "மத்திய மாகாணம்",
      districts: [
        {
          name: "நுவரெலியா",
          images: [
            "https://www.tourhero.com/en/magazine/wp-content/uploads/2020/12/Nuwara-Eliya-Waterfalls.jpg",
            "https://live.staticflickr.com/65535/53617448573_9032c6dfbc_z.jpg",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "மாத்தளை",
          images: [
            "https://hoteliermaldives.com/wp-content/uploads/Matale-Featured-720x480.jpg",
            "https://live.staticflickr.com/65535/53616365352_88195df941_k.jpg",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [

          ],
        },
        {
          name: "கண்டி",
          images: [
            "https://colombogazette.com/wp-content/uploads/2021/05/Kandy.jpg",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [

          ],
        }
      ],
    },
    {
      provinceName: "ஊவா மாகாணம்",
      districts: [
        {
          name: "பதுளை",
          images: [
            "https://media-cdn.tripadvisor.com/media/photo-s/1a/15/8c/a0/ella-is-a-small-town.jpg",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "மொனராகலை",
          images: [
            "https://us.lakpura.com/cdn/shop/files/LK66200125-02-E.jpg?v=1660566072&width=3200",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        }
      ],
    },
    {
      provinceName: "மேல் மாகாணம்",
      districts: [
        {
          name: "கொழும்பு",
          images: [
            "https://www.andbeyond.com/wp-content/uploads/sites/5/colombo-sri-lanka.jpg",
            "https://live.staticflickr.com/65535/53617448823_35e5ed8bec_k.jpg",
            "district12_image2.jpg",
            "district12_image10.jpg",
          ],
          schedule: {
            date: "2024-03-30 , 2024-03-31",
            time: "மு.ப 8:00",
            venue: "இந்துக் கல்லூரி, கொழும்பு",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "கம்பகா",
          images: [
            "https://vathmisilva.files.wordpress.com/2020/07/henarathgoda-botanical-garden4-1.jpg",
            "https://live.staticflickr.com/65535/53617448788_aafc37632e_k.jpg",
            "district13_image2.jpg",
            "district13_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "களுத்துறை",
          images: [
            "https://img.traveltriangle.com/blog/wp-content/uploads/2019/09/cover-things-to-do-in-Kalutara.jpg",
            "https://live.staticflickr.com/65535/53617575639_ef7bccbbf5_k.jpg",
            "district14_image2.jpg",
            "district14_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
      ],
    },
    {
      provinceName: "வடமேல் மாகாணம்",
      districts: [
        {
          name: "குருநாகல்",
          images: [
            "https://img.traveltriangle.com/blog/wp-content/uploads/2018/12/Cover-for-Places-to-visit-in-Kurunegala.jpg",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "புத்தளம்",
          images: [
            "https://www.hotelscombined.com/rimg/dimg/16/71/1bacba85-city-46478-169110981a8.jpg?width=1366&height=768&xhint=1958&yhint=842&crop=true",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        }
      ]
    },
    {
      provinceName: "தெற்கு மாகாணம்",
      districts: [
        {
          name: "காலி",
          images: [
            "https://slrailwayforum.com/content/images/2023/04/Galle-Fort.jpg",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "மாத்தறை",
          images: [
            "https://www.hotelscombined.com/rimg/dimg/07/5e/1fe43003-city-67263-166597d2d20.jpg?width=1366&height=768&xhint=2493&yhint=1953&crop=true&watermarkposition=lowerright",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "அம்பாந்தோட்டை",
          images: [
            "https://www.birdspark.lk/wp-content/uploads/2021/07/Love-Birds-1.jpg",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        }
      ],
    },
    {
      provinceName: "வடமத்திய மாகாணம்",
      districts: [
        {
          name: "அநுராதபுரம்",
          images: [
            "https://www.traxplorio.com/wp-content/uploads/2021/10/2021-10-07_615eb83786e14_01.jpg",
            "district10_image2.jpg",
            "district10_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        },
        {
          name: "பொலன்நறுவை",
          images: [
            "https://speedway.lk/wp-content/uploads/2023/10/Sacred-City-of-Polonnaruwa.jpg",
            "district11_image2.jpg",
            "district11_image10.jpg",
          ],
          schedule: {
            // date: "2024-05-10",
            // time: "10:00 AM",
            // venue: "Jaffna Central College",
          },
          winning_schools: {
            // "1st_place": "Jaffna Hindu College",
            // "2nd_place": "St. John's College",
            // "3rd_place": "St. Patrick's College",
          },
          participated_schools: [
          ],
        }
      ],
    }
  ];
export default SotkanaiData;