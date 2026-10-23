// Optimized WebP images (60% smaller than originals)
import room1 from "./images/optimized/details-1.webp";
import room2 from "./images/optimized/details-2.webp";
import room3 from "./images/optimized/details-3.webp";
import room4 from "./images/optimized/details-4.webp";
import img1 from "./images/optimized/room-1.webp";
import img2 from "./images/optimized/room-2.webp";
import img3 from "./images/optimized/room-3.webp";
import img4 from "./images/optimized/room-4.webp";
import img5 from "./images/optimized/room-5.webp";
import img6 from "./images/optimized/room-6.webp";
import img7 from "./images/optimized/room-7.webp";
import img8 from "./images/optimized/room-8.webp";
import img9 from "./images/optimized/room-9.webp";
import img10 from "./images/optimized/room-10.webp";
import img11 from "./images/optimized/room-11.webp";
import img12 from "./images/optimized/room-12.webp";

const rooms = [
  {
    sys: {
      id: "1"
    },
    fields: {
      name: "single economy",
      slug: "single-economy",
      type: "single",
      price: 100,
      size: 200,
      capacity: 1,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "Our Single Economy room offers everything you need for a comfortable stay. Featuring a plush queen-sized bed, modern amenities, and a peaceful atmosphere, this room is ideal for business travelers or solo adventurers seeking quality accommodation at an affordable price. Enjoy complimentary Wi-Fi, a work desk, and access to our fitness center.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img1
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "2"
    },
    fields: {
      name: "single basic",
      slug: "single-basic",
      type: "single",
      price: 150,
      size: 250,
      capacity: 1,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "Step into comfort with our Single Basic room. This thoughtfully designed space features premium bedding, a spacious bathroom with rain shower, and a cozy seating area. Perfect for guests who appreciate simplicity without compromising on quality. Wake up refreshed and ready to explore with our complimentary morning coffee.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img2
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "3"
    },
    fields: {
      name: "single standard",
      slug: "single-standard",
      type: "single",
      price: 250,
      size: 300,
      capacity: 1,
      pets: true,
      breakfast: false,
      featured: false,
      description:
        "Experience elevated comfort in our Single Standard room. Enjoy additional living space, a luxurious king-sized bed, and a private balcony with stunning views. This pet-friendly room includes a mini-bar, smart TV with streaming services, and premium toiletries. The perfect retreat after a day of adventure.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img3
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "4"
    },
    fields: {
      name: "single deluxe",
      slug: "single-deluxe",
      type: "single",
      price: 300,
      size: 400,
      capacity: 1,
      pets: true,
      breakfast: true,
      featured: false,
      description:
        "Indulge in our Single Deluxe room, where luxury meets comfort. This spacious retreat features a pillow-top king bed, spa-inspired bathroom with soaking tub, and exclusive access to our executive lounge. Complimentary breakfast, evening turndown service, and premium amenities ensure an unforgettable stay.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img4
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "5"
    },
    fields: {
      name: "double economy",
      slug: "double-economy",
      type: "double",
      price: 200,
      size: 300,
      capacity: 2,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "Our Double Economy room provides excellent value for couples or traveling companions. Featuring two comfortable beds or one queen bed, ample closet space, and a functional workspace, this room delivers comfort without breaking the bank. Enjoy free parking and complimentary morning coffee.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img5
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "6"
    },
    fields: {
      name: "double basic",
      slug: "double-basic",
      type: "double",
      price: 250,
      size: 350,
      capacity: 2,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "The Double Basic room offers generous space and modern comforts for two guests. Relax on premium mattresses, enjoy the large flat-screen TV, and freshen up in the beautifully appointed bathroom. Ideal for weekend getaways or extended stays with friends.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img6
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "7"
    },
    fields: {
      name: "double standard",
      slug: "double-standard",
      type: "double",
      price: 300,
      size: 400,
      capacity: 2,
      pets: true,
      breakfast: false,
      featured: false,
      description:
        "Discover the perfect blend of space and style in our Double Standard room. This pet-friendly accommodation features a sitting area, work desk, and panoramic windows showcasing beautiful surroundings. Two queen beds ensure restful sleep, while modern amenities keep you connected.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img7
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "8"
    },
    fields: {
      name: "double deluxe",
      slug: "double-deluxe",
      type: "double",
      price: 400,
      size: 500,
      capacity: 2,
      pets: true,
      breakfast: true,
      featured: true,
      description:
        "Our Double Deluxe room redefines comfort for two. Sink into plush king beds, enjoy the spacious living area, and pamper yourself in the marble bathroom with dual vanities. Complimentary gourmet breakfast, evening appetizers, and concierge service make this the ultimate couples' retreat.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img8
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "9"
    },
    fields: {
      name: "family economy",
      slug: "family-economy",
      type: "family",
      price: 300,
      size: 500,
      capacity: 3,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "Create family memories without stretching your budget in our Family Economy room. Designed with families in mind, this room features flexible sleeping arrangements for up to 3 guests, a mini-refrigerator, and kid-friendly amenities. Enjoy easy access to our pool and playground areas.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img9
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "10"
    },
    fields: {
      name: "family basic",
      slug: "family-basic",
      type: "family",
      price: 350,
      size: 550,
      capacity: 4,
      pets: false,
      breakfast: false,
      featured: false,
      description:
        "Our Family Basic room provides the space and comfort your family needs. Accommodating up to 4 guests, this room features a king bed plus twin bunks or rollaway options, a seating area for family time, and a generous bathroom. Kids stay free and enjoy our activity programs.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img10
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "11"
    },
    fields: {
      name: "family standard",
      slug: "family-standard",
      type: "family",
      price: 400,
      size: 600,
      capacity: 5,
      pets: true,
      breakfast: false,
      featured: false,
      description:
        "The Family Standard room offers the space and privacy families need. This pet-friendly suite features a master sleeping area plus separate space for children, a full sofa bed, and a kitchenette for family snacks. Enjoy our kids' club and family pool activities.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img11
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "12"
    },
    fields: {
      name: "family deluxe",
      slug: "family-deluxe",
      type: "family",
      price: 500,
      size: 700,
      capacity: 6,
      pets: true,
      breakfast: true,
      featured: true,
      description:
        "Experience family travel at its finest in our Family Deluxe suite. This expansive accommodation sleeps up to 6 guests in supreme comfort, featuring a master bedroom, children's sleeping area, living room, and dining space. Complimentary breakfast, kids' activity programs, and dedicated family concierge service included.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: img12
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  },
  {
    sys: {
      id: "13"
    },
    fields: {
      name: "presidential",
      slug: "presidential-room",
      type: "presidential",
      price: 600,
      size: 1000,
      capacity: 10,
      pets: true,
      breakfast: true,
      featured: true,
      description:
        "The Presidential Suite represents the pinnacle of luxury accommodation. Spanning 1000 square feet, this magnificent suite features a grand master bedroom, formal living and dining areas, private study, and a spa-inspired bathroom with sauna. Enjoy 24-hour butler service, complimentary airport transfers, exclusive lounge access, and customized experiences tailored to your preferences.",
      extras: [
        "Plush pillows and breathable bed linens",
        "Soft, oversized bath towels",
        "Full-sized, pH-balanced toiletries",
        "Complimentary refreshments",
        "Adequate safety/security",
        "Internet",
        "Comfortable beds"
      ],
      images: [
        {
          fields: {
            file: {
              url: room1
            }
          }
        },
        {
          fields: {
            file: {
              url: room2
            }
          }
        },
        {
          fields: {
            file: {
              url: room3
            }
          }
        },
        {
          fields: {
            file: {
              url: room4
            }
          }
        }
      ]
    }
  }
];

export default rooms;
