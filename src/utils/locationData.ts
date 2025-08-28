import Papa from 'papaparse';

// Raw CSV data provided by the user
const rawCsvData = `province_code,province_name,district_code (old),district_name (old),ward_code,ward_name
01,Thành phố Hà Nội,10105,Quận Hoàn Kiếm,10105001,Phường Hoàn Kiếm
01,Thành phố Hà Nội,10105,Quận Hoàn Kiếm,10105002,Phường Cửa Nam
01,Thành phố Hà Nội,10101,Quận Ba Đình,10101003,Phường Ba Đình
01,Thành phố Hà Nội,10101,Quận Ba Đình,10101004,Phường Ngọc Hà
01,Thành phố Hà Nội,10101,Quận Ba Đình,10101005,Phường Giảng Võ
01,Thành phố Hà Nội,10107,Quận Hai Bà Trưng,10107006,Phường Hai Bà Trưng
01,Thành phố Hà Nội,10107,Quận Hai Bà Trưng,10107007,Phường Vĩnh Tuy
01,Thành phố Hà Nội,10107,Quận Hai Bà Trưng,10107008,Phường Bạch Mai
01,Thành phố Hà Nội,10109,Quận Đống Đa,10109009,Phường Đống Đa
01,Thành phố Hà Nội,10109,Quận Đống Đa,10109010,Phường Kim Liên
01,Thành phố Hà Nội,10109,Quận Đống Đa,10109011,Phường Văn Miếu - Quốc Tử Giám
01,Thành phố Hà Nội,10109,Quận Đống Đa,10109012,Phường Láng
01,Thành phố Hà Nội,10109,Quận Đống Đa,10109013,Phường Ô Chợ Dừa
01,Thành phố Hà Nội,10103,Quận Tây Hồ,10103014,Phường Hồng Hà
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108015,Phường Lĩnh Nam
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108016,Phường Hoàng Mai
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108017,Phường Vĩnh Hưng
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108018,Phường Tương Mai
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108019,Phường Định Công
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123020,Phường Hoàng Liệt
01,Thành phố Hà Nội,10108,Quận Hoàng Mai,10108021,Phường Yên Sở
01,Thành phố Hà Nội,10111,Quận Thanh Xuân,10111022,Phường Thanh Xuân
01,Thành phố Hà Nội,10111,Quận Thanh Xuân,10111023,Phường Khương Đình
01,Thành phố Hà Nội,10111,Quận Thanh Xuân,10111024,Phường Phương Liệt
01,Thành phố Hà Nội,10113,Quận Cầu Giấy,10113025,Phường Cầu Giấy
01,Thành phố Hà Nội,10113,Quận Cầu Giấy,10113026,Phường Nghĩa Đô
01,Thành phố Hà Nội,10113,Quận Cầu Giấy,10113027,Phường Yên Hoà
01,Thành phố Hà Nội,10103,Quận Tây Hồ,10103028,Phường Tây Hồ
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157029,Phường Phú Thượng
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157030,Phường Tây Tựu
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157031,Phường Phú Diễn
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157032,Phường Xuân Đỉnh
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157033,Phường Đông Ngạc
01,Thành phố Hà Nội,10157,Quận Bắc Từ Liêm,10157034,Phường Thượng Cát
01,Thành phố Hà Nội,10155,Quận Nam Từ Liêm,10155035,Phường Từ Liêm
01,Thành phố Hà Nội,10155,Quận Nam Từ Liêm,10155036,Phường Xuân Phương
01,Thành phố Hà Nội,10155,Quận Nam Từ Liêm,10155037,Phường Tây Mỗ
01,Thành phố Hà Nội,10155,Quận Nam Từ Liêm,10155038,Phường Đại Mỗ
01,Thành phố Hà Nội,10106,Quận Long Biên,10106039,Phường Long Biên
01,Thành phố Hà Nội,10106,Quận Long Biên,10106040,Phường Bồ Đề
01,Thành phố Hà Nội,10106,Quận Long Biên,10106041,Phường Việt Hưng
01,Thành phố Hà Nội,10106,Quận Long Biên,10106042,Phường Phúc Lợi
01,Thành phố Hà Nội,10127,Quận Hà Đông,10127043,Phường Hà Đông
01,Thành phố Hà Nội,10127,Quận Hà Đông,10127044,Phường Dương Nội
01,Thành phố Hà Nội,10127,Quận Hà Đông,10127045,Phường Yên Nghĩa
01,Thành phố Hà Nội,10127,Quận Hà Đông,10127046,Phường Phú Lương
01,Thành phố Hà Nội,10127,Quận Hà Đông,10127047,Phường Kiến Hưng
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123048,Xã Thanh Trì
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123049,Xã Đại Thanh
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123050,Xã Nam Phù
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123051,Xã Ngọc Hồi
01,Thành phố Hà Nội,10123,Huyện Thanh Trì,10123052,Phường Thanh Liệt
01,Thành phố Hà Nội,10143,Huyện Thường Tín,10143053,Xã Thượng Phúc
01,Thành phố Hà Nội,10143,Huyện Thường Tín,10143054,Xã Thường Tín
01,Thành phố Hà Nội,10143,Huyện Thường Tín,10143055,Xã Chương Dương
01,Thành phố Hà Nội,10143,Huyện Thường Tín,10143056,Xã Hồng Vân
01,Thành phố Hà Nội,10149,Huyện Phú Xuyên,10149057,Xã Phú Xuyên
01,Thành phố Hà Nội,10149,Huyện Phú Xuyên,10149058,Xã Phượng Dực
01,Thành phố Hà Nội,10149,Huyện Phú Xuyên,10149059,Xã Chuyên Mỹ
01,Thành phố Hà Nội,10149,Huyện Phú Xuyên,10149060,Xã Đại Xuyên
01,Thành phố Hà Nội,10141,Huyện Thanh Oai,10141061,Xã Thanh Oai
01,Thành phố Hà Nội,10141,Huyện Thanh Oai,10141062,Xã Bình Minh
01,Thành phố Hà Nội,10141,Huyện Thanh Oai,10141063,Xã Tam Hưng
01,Thành phố Hà Nội,10141,Huyện Thanh Oai,10141064,Xã Dân Hoà
01,Thành phố Hà Nội,10147,Huyện Ứng Hoà,10147065,Xã Vân Đình
01,Thành phố Hà Nội,10147,Huyện Ứng Hoà,10147066,Xã Ứng Thiên
01,Thành phố Hà Nội,10147,Huyện Ứng Hoà,10147067,Xã Hoà Xá
01,Thành phố Hà Nội,10147,Huyện Ứng Hoà,10147068,Xã Ứng Hoà
01,Thành phố Hà Nội,10145,Huyện Mỹ Đức,10145069,Xã Mỹ Đức
01,Thành phố Hà Nội,10145,Huyện Mỹ Đức,10145070,Xã Hồng Sơn
01,Thành phố Hà Nội,10145,Huyện Mỹ Đức,10145071,Xã Phúc Sơn
01,Thành phố Hà Nội,10145,Huyện Mỹ Đức,10145072,Xã Hương Sơn
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153073,Phường Chương Mỹ
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153074,Xã Phú Nghĩa
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153075,Xã Xuân Mai
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153076,Xã Trần Phú
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153077,Xã Hoà Phú
01,Thành phố Hà Nội,10153,Huyện Chương Mỹ,10153078,Xã Quảng Bị
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151079,Xã Minh Châu
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151080,Xã Quảng Oai
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151081,Xã Vật Lại
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151082,Xã Cổ Đô
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151083,Xã Bất Bạt
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151084,Xã Suối Hai
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151085,Xã Ba Vì
01,Thành phố Hà Nội,10151,Huyện Ba Vì,10151086,Xã Yên Bài
01,Thành phố Hà Nội,10129,Thị xã Sơn Tây,10129087,Phường Sơn Tây
01,Thành phố Hà Nội,10129,Thị xã Sơn Tây,10129088,Phường Tùng Thiện
01,Thành phố Hà Nội,10129,Thị xã Sơn Tây,10129089,Xã Đoài Phương
01,Thành phố Hà Nội,10131,Huyện Phúc Thọ,10131090,Xã Phúc Thọ
01,Thành phố Hà Nội,10131,Huyện Phúc Thọ,10131091,Xã Phúc Lộc
01,Thành phố Hà Nội,10131,Huyện Phúc Thọ,10131092,Xã Hát Môn
01,Thành phố Hà Nội,10135,Huyện Thạch Thất,10135093,Xã Thạch Thất
01,Thành phố Hà Nội,10135,Huyện Thạch Thất,10135094,Xã Hạ Bằng
01,Thành phố Hà Nội,10135,Huyện Thạch Thất,10135095,Xã Tây Phương
01,Thành phố Hà Nội,10135,Huyện Thạch Thất,10135096,Xã Hoà Lạc
01,Thành phố Hà Nội,10135,Huyện Thạch Thất,10135097,Xã Yên Xuân
01,Thành phố Hà Nội,10139,Huyện Quốc Oai,10139098,Xã Quốc Oai
01,Thành phố Hà Nội,10139,Huyện Quốc Oai,10139099,Xã Hưng Đạo
01,Thành phố Hà Nội,10139,Huyện Quốc Oai,10139100,Xã Kiều Phú
01,Thành phố Hà Nội,10139,Huyện Quốc Oai,10139101,Xã Phú Cát
01,Thành phố Hà Nội,10137,Huyện Hoài Đức,10137102,Xã Hoài Đức
01,Thành phố Hà Nội,10137,Huyện Hoài Đức,10137103,Xã Dương Hoà
01,Thành phố Hà Nội,10137,Huyện Hoài Đức,10137104,Xã Sơn Đồng
01,Thành phố Hà Nội,10137,Huyện Hoài Đức,10137105,Xã An Khánh
01,Thành phố Hà Nội,10133,Huyện Đan Phượng,10133106,Xã Đan Phượng
01,Thành phố Hà Nội,10133,Huyện Đan Phượng,10133107,Xã Ô Diên
01,Thành phố Hà Nội,10133,Huyện Đan Phượng,10133108,Xã Liên Minh
01,Thành phố Hà Nội,10119,Huyện Gia Lâm,10119109,Xã Gia Lâm
01,Thành phố Hà Nội,10119,Huyện Gia Lâm,10119110,Xã Thuận An
01,Thành phố Hà Nội,10119,Huyện Gia Lâm,10119111,Xã Bát Tràng
01,Thành phố Hà Nội,10119,Huyện Gia Lâm,10119112,Xã Phù Đổng
01,Thành phố Hà Nội,10117,Huyện Đông Anh,10117113,Xã Thư Lâm
01,Thành phố Hà Nội,10117,Huyện Đông Anh,10117114,Xã Đông Anh
01,Thành phố Hà Nội,10117,Huyện Đông Anh,10117115,Xã Phúc Thịnh
01,Thành phố Hà Nội,10117,Huyện Đông Anh,10117116,Xã Thiên Lộc
01,Thành phố Hà Nội,10117,Huyện Đông Anh,10117117,Xã Vĩnh Thanh
01,Thành phố Hà Nội,10125,Huyện Mê Linh,10125118,Xã Mê Linh
01,Thành phố Hà Nội,10125,Huyện Mê Linh,10125119,Xã Yên Lãng
01,Thành phố Hà Nội,10125,Huyện Mê Linh,10125120,Xã Tiến Thắng
01,Thành phố Hà Nội,10125,Huyện Mê Linh,10125121,Xã Quang Minh
01,Thành phố Hà Nội,10115,Huyện Sóc Sơn,10115122,Xã Sóc Sơn
01,Thành phố Hà Nội,10115,Huyện Sóc Sơn,10115123,Xã Đa Phúc
01,Thành phố Hà Nội,10115,Huyện Sóc Sơn,10115124,Xã Nội Bài
01,Thành phố Hà Nội,10115,Huyện Sóc Sơn,10115125,Xã Trung Giã
01,Thành phố Hà Nội,10115,Huyện Sóc Sơn,10115126,Xã Kim Anh
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113001,Xã Đại Sơn
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113002,Xã Sơn Động
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113003,Xã Tây Yên Tử
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113004,Xã Dương Hưu
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113005,Xã Yên Định
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113006,Xã An Lạc
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113007,Xã Vân Sơn
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107008,Xã Biển Động
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107009,Xã Lục Ngạn
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107010,Xã Đèo Gia
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107011,Xã Sơn Hải
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107012,Xã Tân Sơn
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107013,Xã Biên Sơn
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107014,Xã Sa Lý
02,Tỉnh Bắc Ninh,22107,Huyện Lục Ngạn,22107015,Xã Nam Dương
02,Tỉnh Bắc Ninh,22121,Thị xã Chũ,22121016,Xã Kiên Lao
02,Tỉnh Bắc Ninh,22121,Thị xã Chũ,22121017,Phường Chũ
02,Tỉnh Bắc Ninh,22121,Thị xã Chũ,22121018,Phường Phượng Sơn
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115019,Xã Lục Sơn
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115020,Xã Trường Sơn
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115021,Xã Cẩm Lý
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115022,Xã Đông Phú
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115023,Xã Nghĩa Phương
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115024,Xã Lục Nam
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115025,Xã Bắc Lũng
02,Tỉnh Bắc Ninh,22115,Huyện Lục Nam,22115026,Xã Bảo Đài
02,Tỉnh Bắc Ninh,22111,Huyện Lạng Giang,22111027,Xã Lạng Giang
02,Tỉnh Bắc Ninh,22111,Huyện Lạng Giang,22111028,Xã Mỹ Thái
02,Tỉnh Bắc Ninh,22111,Huyện Lạng Giang,22111029,Xã Kép
02,Tỉnh Bắc Ninh,22111,Huyện Lạng Giang,22111030,Xã Tân Dĩnh
02,Tỉnh Bắc Ninh,22111,Huyện Lạng Giang,22111031,Xã Tiên Lục
02,Tỉnh Bắc Ninh,22103,Huyện Yên Thế,22103032,Xã Yên Thế
02,Tỉnh Bắc Ninh,22103,Huyện Yên Thế,22103033,Xã Bố Hạ
02,Tỉnh Bắc Ninh,22103,Huyện Yên Thế,22103034,Xã Đồng Kỳ
02,Tỉnh Bắc Ninh,22103,Huyện Yên Thế,22103035,Xã Xuân Lương
02,Tỉnh Bắc Ninh,22103,Huyện Yên Thế,22103036,Xã Tam Tiến
02,Tỉnh Bắc Ninh,22105,Huyện Tân Yên,22105037,Xã Tân Yên
02,Tỉnh Bắc Ninh,22105,Huyện Tân Yên,22105038,Xã Ngọc Thiện
02,Tỉnh Bắc Ninh,22105,Huyện Tân Yên,22105039,Xã Nhã Nam
02,Tỉnh Bắc Ninh,22105,Huyện Tân Yên,22105040,Xã Phúc Hoà
02,Tỉnh Bắc Ninh,22105,Huyện Tân Yên,22105041,Xã Quang Trung
02,Tỉnh Bắc Ninh,22109,Huyện Hiệp Hoà,22109042,Xã Hợp Thịnh
02,Tỉnh Bắc Ninh,22109,Huyện Hiệp Hoà,22109043,Xã Hiệp Hoà
02,Tỉnh Bắc Ninh,22109,Huyện Hiệp Hoà,22109044,Xã Hoàng Vân
02,Tỉnh Bắc Ninh,22109,Huyện Hiệp Hoà,22109045,Xã Xuân Cẩm
02,Tỉnh Bắc Ninh,22117,Thị xã Việt Yên,22117046,Phường Tự Lạn
02,Tỉnh Bắc Ninh,22117,Thị xã Việt Yên,22117047,Phường Việt Yên
02,Tỉnh Bắc Ninh,22117,Thị xã Việt Yên,22117048,Phường Nếnh
02,Tỉnh Bắc Ninh,22117,Thị xã Việt Yên,22117049,Phường Vân Hà
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101050,Xã Đồng Việt
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101051,Phường Bắc Giang
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101052,Phường Đa Mai
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101053,Phường Tiền Phong
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101054,Phường Tân An
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101055,Phường Yên Dũng
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101056,Phường Tân Tiến
02,Tỉnh Bắc Ninh,22101,Thành phố Bắc Giang,22101057,Phường Cảnh Thụy
02,Tỉnh Bắc Ninh,22301,Thành phố Bắc Ninh,22301058,Phường Kinh Bắc
02,Tỉnh Bắc Ninh,22301,Thành phố Bắc Ninh,22301059,Phường Võ Cường
02,Tỉnh Bắc Ninh,22301,Thành phố Bắc Ninh,22301060,Phường Vũ Ninh
02,Tỉnh Bắc Ninh,22301,Thành phố Bắc Ninh,22301061,Phường Hạp Lĩnh
02,Tỉnh Bắc Ninh,22301,Thành phố Bắc Ninh,22301062,Phường Nam Sơn
02,Tỉnh Bắc Ninh,22313,Thị xã Từ Sơn,22313063,Phường Từ Sơn
02,Tỉnh Bắc Ninh,22313,Thị xã Từ Sơn,22313064,Phường Tam Sơn
02,Tỉnh Bắc Ninh,22313,Thị xã Từ Sơn,22313065,Phường Đồng Nguyên
02,Tỉnh Bắc Ninh,22313,Thị xã Từ Sơn,22313066,Phường Phù Khê
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309067,Phường Thuận Thành
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309068,Phường Mão Điền
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309069,Phường Trạm Lộ
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309070,Phường Trí Quả
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309071,Phường Song Liễu
02,Tỉnh Bắc Ninh,22309,Thị xã Thuận Thành,22309072,Phường Ninh Xá
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305073,Phường Quế Võ
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305074,Phường Phương Liễu
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305075,Phường Nhân Hoà
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305076,Phường Đào Viên
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305077,Phường Bồng Lai
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305078,Xã Chi Lăng
02,Tỉnh Bắc Ninh,22305,Thị xã Quế Võ,22305079,Xã Phù Lãng
02,Tỉnh Bắc Ninh,22303,Huyện Yên Phong,22303080,Xã Yên Phong
02,Tỉnh Bắc Ninh,22303,Huyện Yên Phong,22303081,Xã Văn Môn
02,Tỉnh Bắc Ninh,22303,Huyện Yên Phong,22303082,Xã Tam Giang
02,Tỉnh Bắc Ninh,22303,Huyện Yên Phong,22303083,Xã Yên Trung
02,Tỉnh Bắc Ninh,22303,Huyện Yên Phong,22303084,Xã Tam Đa
02,Tỉnh Bắc Ninh,22307,Huyện Tiên Du,22307085,Xã Tiên Du
02,Tỉnh Bắc Ninh,22307,Huyện Tiên Du,22307086,Xã Liên Bão
02,Tỉnh Bắc Ninh,22307,Huyện Tiên Du,22307087,Xã Tân Chi
02,Tỉnh Bắc Ninh,22307,Huyện Tiên Du,22307088,Xã Đại Đồng
02,Tỉnh Bắc Ninh,22307,Huyện Tiên Du,22307089,Xã Phật Tích
02,Tỉnh Bắc Ninh,22315,Huyện Gia Bình,22315090,Xã Gia Bình
02,Tỉnh Bắc Ninh,22315,Huyện Gia Bình,22315091,Xã Nhân Thắng
02,Tỉnh Bắc Ninh,22315,Huyện Gia Bình,22315092,Xã Đại Lai
02,Tỉnh Bắc Ninh,22315,Huyện Gia Bình,22315093,Xã Cao Đức
02,Tỉnh Bắc Ninh,22315,Huyện Gia Bình,22315094,Xã Đông Cứu
02,Tỉnh Bắc Ninh,22311,Huyện Lương Tài,22311095,Xã Lương Tài
02,Tỉnh Bắc Ninh,22311,Huyện Lương Tài,22311096,Xã Lâm Thao
02,Tỉnh Bắc Ninh,22311,Huyện Lương Tài,22311097,Xã Trung Chính
02,Tỉnh Bắc Ninh,22311,Huyện Lương Tài,22311098,Xã Trung Kênh
02,Tỉnh Bắc Ninh,22113,Huyện Sơn Động,22113099,Xã Tuấn Đạo
03,Tỉnh Quảng Ninh,22521,Thành phố Đông Triều,22521001,Phường An Sinh
03,Tỉnh Quảng Ninh,22521,Thành phố Đông Triều,22521002,Phường Đông Triều
03,Tỉnh Quảng Ninh,22521,Thành phố Đông Triều,22521003,Phường Bình Khê
03,Tỉnh Quảng Ninh,22521,Thành phố Đông Triều,22521004,Phường Mạo Khê
03,Tỉnh Quảng Ninh,22521,Thành phố Đông Triều,22521005,Phường Hoàng Quế
03,Tỉnh Quảng Ninh,22505,Thành phố Uông Bí,22505006,Phường Yên Tử
03,Tỉnh Quảng Ninh,22505,Thành phố Uông Bí,22505007,Phường Vàng Danh
03,Tỉnh Quảng Ninh,22505,Thành phố Uông Bí,22505008,Phường Uông Bí
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525009,Phường Đông Mai
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525010,Phường Hiệp Hoà
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525011,Phường Quảng Yên
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525012,Phường Hà An
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525013,Phường Phong Cốc
03,Tỉnh Quảng Ninh,22525,Thị xã Quảng Yên,22525014,Phường Liên Hoà
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501015,Phường Tuần Châu
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501016,Phường Việt Hưng
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501017,Phường Bãi Cháy
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501018,Phường Hà Tu
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501019,Phường Hà Lầm
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501020,Phường Cao Xanh
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501021,Phường Hồng Gai
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501022,Phường Hạ Long
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501023,Phường Hoành Bồ
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501024,Xã Quảng La
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501025,Xã Thống Nhất
03,Tỉnh Quảng Ninh,22503,Thành phố Cẩm Phả,22503026,Phường Mông Dương
03,Tỉnh Quảng Ninh,22503,Thành phố Cẩm Phả,22503027,Phường Quang Hanh
03,Tỉnh Quảng Ninh,22503,Thành phố Cẩm Phả,22503028,Phường Cẩm Phả
03,Tỉnh Quảng Ninh,22503,Thành phố Cẩm Phả,22503029,Phường Cửa Ông
03,Tỉnh Quảng Ninh,22503,Thành phố Cẩm Phả,22503030,Xã Hải Hoà
03,Tỉnh Quảng Ninh,22513,Huyện Tiên Yên,22513031,Xã Tiên Yên
03,Tỉnh Quảng Ninh,22513,Huyện Tiên Yên,22513032,Xã Điền Xá
03,Tỉnh Quảng Ninh,22513,Huyện Tiên Yên,22513033,Xã Đông Ngũ
03,Tỉnh Quảng Ninh,22513,Huyện Tiên Yên,22513034,Xã Hải Lạng
03,Tỉnh Quảng Ninh,22501,Thành phố Hạ Long,22501035,Xã Lương Minh
03,Tỉnh Quảng Ninh,22515,Huyện Ba Chẽ,22515036,Xã Kỳ Thượng
03,Tỉnh Quảng Ninh,22515,Huyện Ba Chẽ,22515037,Xã Ba Chẽ
03,Tỉnh Quảng Ninh,22527,Huyện Đầm Hà,22527038,Xã Quảng Tân
03,Tỉnh Quảng Ninh,22527,Huyện Đầm Hà,22527039,Xã Đầm Hà
03,Tỉnh Quảng Ninh,22511,Huyện Hải Hà,22511040,Xã Quảng Hà
03,Tỉnh Quảng Ninh,22511,Huyện Hải Hà,22511041,Xã Đường Hoa
03,Tỉnh Quảng Ninh,22511,Huyện Hải Hà,22511042,Xã Quảng Đức
03,Tỉnh Quảng Ninh,22507,Huyện Bình Liêu,22507043,Xã Hoành Mô
03,Tỉnh Quảng Ninh,22507,Huyện Bình Liêu,22507044,Xã Lục Hồn
03,Tỉnh Quảng Ninh,22507,Huyện Bình Liêu,22507045,Xã Bình Liêu
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509046,Xã Hải Sơn
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509047,Xã Hải Ninh
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509048,Xã Vĩnh Thực
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509049,Phường Móng Cái 1
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509050,Phường Móng Cái 2
03,Tỉnh Quảng Ninh,22509,Thành phố Móng Cái,22509051,Phường Móng Cái 3
03,Tỉnh Quảng Ninh,22517,Huyện Vân Đồn,22517052,Đặc khu Vân Đồn
03,Tỉnh Quảng Ninh,22523,Huyện Cô Tô,22523053,Đặc khu Cô Tô
03,Tỉnh Quảng Ninh,22511,Huyện Hải Hà,22511054,Xã Cái Chiên
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311001,Phường Thuỷ Nguyên
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311002,Phường Thiên Hương
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311003,Phường Hoà Bình
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311004,Phường Nam Triệu
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311005,Phường Bạch Đằng
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311006,Phường Lưu Kiếm
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311007,Phường Lê Ích Mộc
04,Tp Hải Phòng,10301,Quận Hồng Bàng,10301008,Phường Hồng Bàng
04,Tp Hải Phòng,10301,Quận Hồng Bàng,10301009,Phường Hồng An
04,Tp Hải Phòng,10303,Quận Ngô Quyền,10303010,Phường Ngô Quyền
04,Tp Hải Phòng,10303,Quận Ngô Quyền,10303011,Phường Gia Viên
04,Tp Hải Phòng,10305,Quận Lê Chân,10305012,Phường Lê Chân
04,Tp Hải Phòng,10305,Quận Lê Chân,10305013,Phường An Biên
04,Tp Hải Phòng,10304,Quận Hải An,10304014,Phường Hải An
04,Tp Hải Phòng,10304,Quận Hải An,10304015,Phường Đông Hải
04,Tp Hải Phòng,10307,Quận Kiến An,10307016,Phường Kiến An
04,Tp Hải Phòng,10307,Quận Kiến An,10307017,Phường Phù Liễn
04,Tp Hải Phòng,10309,Quận Đồ Sơn,10309018,Phường Nam Đồ Sơn
04,Tp Hải Phòng,10309,Quận Đồ Sơn,10309019,Phường Đồ Sơn
04,Tp Hải Phòng,10327,Quận Dương Kinh,10327020,Phường Hưng Đạo
04,Tp Hải Phòng,10327,Quận Dương Kinh,10327021,Phường Dương Kinh
04,Tp Hải Phòng,10313,Quận An Dương,10313022,Phường An Dương
04,Tp Hải Phòng,10313,Quận An Dương,10313023,Phường An Hải
04,Tp Hải Phòng,10313,Quận An Dương,10313024,Phường An Phong
04,Tp Hải Phòng,10315,Huyện An Lão,10315025,Xã An Hưng
04,Tp Hải Phòng,10315,Huyện An Lão,10315026,Xã An Khánh
04,Tp Hải Phòng,10315,Huyện An Lão,10315027,Xã An Quang
04,Tp Hải Phòng,10315,Huyện An Lão,10315028,Xã An Trường
04,Tp Hải Phòng,10315,Huyện An Lão,10315029,Xã An Lão
04,Tp Hải Phòng,10317,Huyện Kiến Thụy,10317030,Xã Kiến Thụy
04,Tp Hải Phòng,10317,Huyện Kiến Thụy,10317031,Xã Kiến Minh
04,Tp Hải Phòng,10317,Huyện Kiến Thụy,10317032,Xã Kiến Hải
04,Tp Hải Phòng,10317,Huyện Kiến Thụy,10317033,Xã Kiến Hưng
04,Tp Hải Phòng,10317,Huyện Kiến Thụy,10317034,Xã Nghi Dương
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319035,Xã Quyết Thắng
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319036,Xã Tiên Lãng
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319037,Xã Tân Minh
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319038,Xã Tiên Minh
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319039,Xã Chấn Hưng
04,Tp Hải Phòng,10319,Huyện Tiên Lãng,10319040,Xã Hùng Thắng
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321041,Xã Vĩnh Bảo
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321042,Xã Nguyễn Bỉnh Khiêm
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321043,Xã Vĩnh Am
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321044,Xã Vĩnh Hải
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321045,Xã Vĩnh Hoà
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321046,Xã Vĩnh Thịnh
04,Tp Hải Phòng,10321,Huyện Vĩnh Bảo,10321047,Xã Vĩnh Thuận
04,Tp Hải Phòng,10311,Thành phố Thuỷ Nguyên,10311048,Xã Việt Khê
04,Tp Hải Phòng,10323,Huyện Cát Hải,10323049,Đặc khu Cát Hải
04,Tp Hải Phòng,10325,Huyện Bạch Long Vĩ,10325050,Đặc khu Bạch Long Vĩ
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701051,Phường Hải Dương
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701052,Phường Lê Thanh Nghị
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701053,Phường Việt Hoà
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701054,Phường Thành Đông
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701055,Phường Nam Đồng
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701056,Phường Tân Hưng
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701057,Phường Thạch Khôi
04,Tp Hải Phòng,10717,Huyện Cẩm Giàng,10717058,Phường Tứ Minh
04,Tp Hải Phòng,10701,Thành phố Hải Dương,10701059,Phường Ái Quốc
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703060,Phường Chu Văn An
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703061,Phường Chí Linh
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703062,Phường Trần Hưng Đạo
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703063,Phường Nguyễn Trãi
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703064,Phường Trần Nhân Tông
04,Tp Hải Phòng,10703,Thành phố Chí Linh,10703065,Phường Lê Đại Hành
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709066,Phường Kinh Môn
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709067,Phường Nguyễn Đại Năng
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709068,Phường Trần Liễu
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709069,Phường Bắc An Phụ
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709070,Phường Phạm Sư Mạnh
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709071,Phường Nhị Chiểu
04,Tp Hải Phòng,10709,Thị xã Kinh Môn,10709072,Xã Nam An Phụ
04,Tp Hải Phòng,10705,Huyện Nam Sách,10705073,Xã Nam Sách
04,Tp Hải Phòng,10705,Huyện Nam Sách,10705074,Xã Thái Tân
04,Tp Hải Phòng,10705,Huyện Nam Sách,10705075,Xã Hợp Tiến
04,Tp Hải Phòng,10705,Huyện Nam Sách,10705076,Xã Trần Phú
04,Tp Hải Phòng,10705,Huyện Nam Sách,10705077,Xã An Phú
04,Tp Hải Phòng,10707,Huyện Thanh Hà,10707078,Xã Thanh Hà
04,Tp Hải Phòng,10707,Huyện Thanh Hà,10707079,Xã Hà Tây
04,Tp Hải Phòng,10707,Huyện Thanh Hà,10707080,Xã Hà Bắc
04,Tp Hải Phòng,10707,Huyện Thanh Hà,10707081,Xã Hà Nam
04,Tp Hải Phòng,10707,Huyện Thanh Hà,10707082,Xã Hà Đông
04,Tp Hải Phòng,10717,Huyện Cẩm Giàng,10717083,Xã Cẩm Giang
04,Tp Hải Phòng,10717,Huyện Cẩm Giàng,10717084,Xã Tuệ Tĩnh
04,Tp Hải Phòng,10717,Huyện Cẩm Giàng,10717085,Xã Mao Điền
04,Tp Hải Phòng,10717,Huyện Cẩm Giàng,10717086,Xã Cẩm Giàng
04,Tp Hải Phòng,10719,Huyện Bình Giang,10719087,Xã Kẻ Sặt
04,Tp Hải Phòng,10719,Huyện Bình Giang,10719088,Xã Bình Giang
04,Tp Hải Phòng,10719,Huyện Bình Giang,10719089,Xã Đường An
04,Tp Hải Phòng,10719,Huyện Bình Giang,10719090,Xã Thượng Hồng
04,Tp Hải Phòng,10713,Huyện Gia Lộc,10713091,Xã Gia Lộc
04,Tp Hải Phòng,10713,Huyện Gia Lộc,10713092,Xã Yết Kiêu
04,Tp Hải Phòng,10713,Huyện Gia Lộc,10713093,Xã Gia Phúc
04,Tp Hải Phòng,10713,Huyện Gia Lộc,10713094,Xã Trường Tân
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715095,Xã Tứ Kỳ
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715096,Xã Tân Kỳ
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715097,Xã Đại Sơn
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715098,Xã Chí Minh
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715099,Xã Lạc Phượng
04,Tp Hải Phòng,10715,Huyện Tứ Kỳ,10715100,Xã Nguyên Giáp
04,Tp Hải Phòng,10723,Huyện Ninh Giang,10723101,Xã Ninh Giang
04,Tp Hải Phòng,10723,Huyện Ninh Giang,10723102,Xã Vĩnh Lại
04,Tp Hải Phòng,10723,Huyện Ninh Giang,10723103,Xã Khúc Thừa Dụ
04,Tp Hải Phòng,10723,Huyện Ninh Giang,10723104,Xã Tân An
04,Tp Hải Phòng,10723,Huyện Ninh Giang,10723105,Xã Hồng Châu
04,Tp Hải Phòng,10721,Huyện Thanh Miện,10721106,Xã Thanh Miện
04,Tp Hải Phòng,10721,Huyện Thanh Miện,10721107,Xã Bắc Thanh Miện
04,Tp Hải Phòng,10721,Huyện Thanh Miện,10721108,Xã Hải Hưng
04,Tp Hải Phòng,10721,Huyện Thanh Miện,10721109,Xã Nguyễn Lương Bằng
04,Tp Hải Phòng,10721,Huyện Thanh Miện,10721110,Xã Nam Thanh Miện
04,Tp Hải Phòng,10711,Huyện Kim Thành,10711111,Xã Phú Thái
04,Tp Hải Phòng,10711,Huyện Kim Thành,10711112,Xã Lai Khê
04,Tp Hải Phòng,10711,Huyện Kim Thành,10711113,Xã An Thành
04,Tp Hải Phòng,10711,Huyện Kim Thành,10711114,Xã Kim Thành
05,Tỉnh Hưng Yên,10901,Thành phố Hưng Yên,10901001,Phường Phố Hiến
05,Tỉnh Hưng Yên,10901,Thành phố Hưng Yên,10901002,Phường Sơn Nam
05,Tỉnh Hưng Yên,10901,Thành phố Hưng Yên,10901003,Phường Hồng Châu
05,Tỉnh Hưng Yên,10903,Thị xã Mỹ Hào,10903004,Phường Mỹ Hào
05,Tỉnh Hưng Yên,10903,Thị xã Mỹ Hào,10903005,Phường Đường Hào
05,Tỉnh Hưng Yên,10903,Thị xã Mỹ Hào,10903006,Phường Thượng Hồng
05,Tỉnh Hưng Yên,10901,Thành phố Hưng Yên,10901007,Xã Tân Hưng
05,Tỉnh Hưng Yên,10913,Huyện Tiên Lữ,10913008,Xã Hoàng Hoa Thám
05,Tỉnh Hưng Yên,10913,Huyện Tiên Lữ,10913009,Xã Tiên Lữ
05,Tỉnh Hưng Yên,10913,Huyện Tiên Lữ,10913010,Xã Tiên Hoa
05,Tỉnh Hưng Yên,10911,Huyện Phù Cừ,10911011,Xã Quang Hưng
05,Tỉnh Hưng Yên,10911,Huyện Phù Cừ,10911012,Xã Đoàn Đào
05,Tỉnh Hưng Yên,10911,Huyện Phù Cừ,10911013,Xã Tiên Tiến
05,Tỉnh Hưng Yên,10911,Huyện Phù Cừ,10911014,Xã Tống Trân
05,Tỉnh Hưng Yên,10909,Huyện Kim Động,10909015,Xã Lương Bằng
05,Tỉnh Hưng Yên,10909,Huyện Kim Động,10909016,Xã Nghĩa Dân
05,Tỉnh Hưng Yên,10909,Huyện Kim Động,10909017,Xã Hiệp Cường
05,Tỉnh Hưng Yên,10909,Huyện Kim Động,10909018,Xã Đức Hợp
05,Tỉnh Hưng Yên,10907,Huyện Ân Thi,10907019,Xã Ân Thi
05,Tỉnh Hưng Yên,10907,Huyện Ân Thi,10907020,Xã Xuân Trúc
05,Tỉnh Hưng Yên,10907,Huyện Ân Thi,10907021,Xã Phạm Ngũ Lão
05,Tỉnh Hưng Yên,10907,Huyện Ân Thi,10907022,Xã Nguyễn Trãi
05,Tỉnh Hưng Yên,10907,Huyện Ân Thi,10907023,Xã Hồng Quang
05,Tỉnh Hưng Yên,10905,Huyện Khoái Châu,10905024,Xã Khoái Châu
05,Tỉnh Hưng Yên,10905,Huyện Khoái Châu,10905025,Xã Triệu Việt Vương
05,Tỉnh Hưng Yên,10905,Huyện Khoái Châu,10905026,Xã Việt Tiến
05,Tỉnh Hưng Yên,10905,Huyện Khoái Châu,10905027,Xã Chí Minh
05,Tỉnh Hưng Yên,10905,Huyện Khoái Châu,10905028,Xã Châu Ninh
05,Tỉnh Hưng Yên,10919,Huyện Yên Mỹ,10919029,Xã Yên Mỹ
05,Tỉnh Hưng Yên,10919,Huyện Yên Mỹ,10919030,Xã Việt Yên
05,Tỉnh Hưng Yên,10919,Huyện Yên Mỹ,10919031,Xã Hoàn Long
05,Tỉnh Hưng Yên,10919,Huyện Yên Mỹ,10919032,Xã Nguyễn Văn Linh
05,Tỉnh Hưng Yên,10917,Huyện Văn Lâm,10917033,Xã Như Quỳnh
05,Tỉnh Hưng Yên,10917,Huyện Văn Lâm,10917034,Xã Lạc Đạo
05,Tỉnh Hưng Yên,10917,Huyện Văn Lâm,10917035,Xã Đại Đồng
05,Tỉnh Hưng Yên,10915,Huyện Văn Giang,10915036,Xã Nghĩa Trụ
05,Tỉnh Hưng Yên,10915,Huyện Văn Giang,10915037,Xã Phụng Công
05,Tỉnh Hưng Yên,10915,Huyện Văn Giang,10915038,Xã Văn Giang
05,Tỉnh Hưng Yên,10915,Huyện Văn Giang,10915039,Xã Mễ Sở
05,Tỉnh Hưng Yên,11501,Thành phố Thái Bình,11501040,Phường Thái Bình
05,Tỉnh Hưng Yên,11501,Thành phố Thái Bình,11501041,Phường Trần Lãm
05,Tỉnh Hưng Yên,11501,Thành phố Thái Bình,11501042,Phường Trần Hưng Đạo
05,Tỉnh Hưng Yên,11501,Thành phố Thái Bình,11501043,Phường Trà Lý
05,Tỉnh Hưng Yên,11501,Thành phố Thái Bình,11501044,Phường Vũ Phúc
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507045,Xã Thái Thụy
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507046,Xã Đông Thụy Anh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507047,Xã Bắc Thụy Anh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507048,Xã Thụy Anh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507049,Xã Nam Thụy Anh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507050,Xã Bắc Thái Ninh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507051,Xã Thái Ninh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507052,Xã Đông Thái Ninh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507053,Xã Nam Thái Ninh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507054,Xã Tây Thái Ninh
05,Tỉnh Hưng Yên,11507,Huyện Thái Thụy,11507055,Xã Tây Thụy Anh
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515056,Xã Tiền Hải
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515057,Xã Tây Tiền Hải
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515058,Xã Ái Quốc
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515059,Xã Đồng Châu
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515060,Xã Đông Tiền Hải
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515061,Xã Nam Cường
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515062,Xã Hưng Phú
05,Tỉnh Hưng Yên,11515,Huyện Tiền Hải,11515063,Xã Nam Tiền Hải
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503064,Xã Quỳnh Phụ
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503065,Xã Minh Thọ
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503066,Xã Nguyễn Du
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503067,Xã Quỳnh An
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503068,Xã Ngọc Lâm
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503069,Xã Đồng Bằng
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503070,Xã A Sào
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503071,Xã Phụ Dực
05,Tỉnh Hưng Yên,11503,Huyện Quỳnh Phụ,11503072,Xã Tân Tiến
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505073,Xã Hưng Hà
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505074,Xã Tiên La
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505075,Xã Lê Quý Đôn
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505076,Xã Hồng Minh
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505077,Xã Thần Khê
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505078,Xã Diên Hà
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505079,Xã Ngự Thiên
05,Tỉnh Hưng Yên,11505,Huyện Hưng Hà,11505080,Xã Long Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509081,Xã Đông Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509082,Xã Bắc Tiên Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509083,Xã Đông Tiên Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509084,Xã Nam Đông Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509085,Xã Bắc Đông Quan
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509086,Xã Bắc Đông Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509087,Xã Đông Quan
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509088,Xã Nam Tiên Hưng
05,Tỉnh Hưng Yên,11509,Huyện Đông Hưng,11509089,Xã Tiên Hưng
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513090,Xã Lê Lợi
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513091,Xã Kiến Xương
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513092,Xã Quang Lịch
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513093,Xã Vũ Quý
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513094,Xã Bình Thanh
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513095,Xã Bình Định
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513096,Xã Hồng Vũ
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513097,Xã Bình Nguyên
05,Tỉnh Hưng Yên,11513,Huyện Kiến Xương,11513098,Xã Trà Giang
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511099,Xã Vũ Thư
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511100,Xã Thư Trì
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511101,Xã Tân Thuận
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511102,Xã Thư Vũ
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511103,Xã Vũ Tiên
05,Tỉnh Hưng Yên,11511,Huyện Vũ Thư,11511104,Xã Vạn Xuân
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707001,Xã Gia Viễn
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707002,Xã Đại Hoàng
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707003,Xã Gia Hưng
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707004,Xã Gia Phong
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707005,Xã Gia Vân
06,Tỉnh Ninh Bình,11707,Huyện Gia Viễn,11707006,Xã Gia Trấn
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705007,Xã Nho Quan
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705008,Xã Gia Lâm
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705009,Xã Gia Tường
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705010,Xã Phú Sơn
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705011,Xã Cúc Phương
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705012,Xã Phú Long
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705013,Xã Thanh Sơn
06,Tỉnh Ninh Bình,11705,Huyện Nho quan,11705014,Xã Quỳnh Lưu
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713015,Xã Yên Khánh
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713016,Xã Khánh Nhạc
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713017,Xã Khánh Thiện
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713018,Xã Khánh Hội
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713019,Xã Khánh Trung
06,Tỉnh Ninh Bình,11711,Huyện Yên Mô,11711020,Xã Yên Mô
06,Tỉnh Ninh Bình,11711,Huyện Yên Mô,11711021,Xã Yên Từ
06,Tỉnh Ninh Bình,11711,Huyện Yên Mô,11711022,Xã Yên Mạc
06,Tỉnh Ninh Bình,11711,Huyện Yên Mô,11711023,Xã Đồng Thái
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715024,Xã Chất Bình
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715025,Xã Kim Sơn
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715026,Xã Quang Thiện
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715027,Xã Phát Diệm
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715028,Xã Lai Thành
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715029,Xã Định Hóa
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715030,Xã Bình Minh
06,Tỉnh Ninh Bình,11715,Huyện Kim Sơn,11715031,Xã Kim Đông
06,Tỉnh Ninh Bình,11111,Huyện Bình Lục,11111032,Xã Bình Lục
06,Tỉnh Ninh Bình,11111,Huyện Bình Lục,11111033,Xã Bình Mỹ
06,Tỉnh Ninh Bình,11111,Huyện Bình Lục,11111034,Xã Bình An
06,Tỉnh Ninh Bình,11111,Huyện Bình Lục,11111035,Xã Bình Giang
06,Tỉnh Ninh Bình,11111,Huyện Bình Lục,11111036,Xã Bình Sơn
06,Tỉnh Ninh Bình,11109,Huyện Thanh Liêm,11109037,Xã Liêm Hà
06,Tỉnh Ninh Bình,11109,Huyện Thanh Liêm,11109038,Xã Tân Thanh
06,Tỉnh Ninh Bình,11109,Huyện Thanh Liêm,11109039,Xã Thanh Bình
06,Tỉnh Ninh Bình,11109,Huyện Thanh Liêm,11109040,Xã Thanh Lâm
06,Tỉnh Ninh Bình,11109,Huyện Thanh Liêm,11109041,Xã Thanh Liêm
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107042,Xã Lý Nhân
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107043,Xã Nam Xang
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107044,Xã Bắc Lý
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107045,Xã Vĩnh Trụ
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107046,Xã Trần Thương
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107047,Xã Nhân Hà
06,Tỉnh Ninh Bình,11107,Huyện Lý Nhân,11107048,Xã Nam Lý
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309049,Xã Nam Trực
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309050,Xã Nam Minh
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309051,Xã Nam Đồng
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309052,Xã Nam Ninh
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309053,Xã Nam Hồng
06,Tỉnh Ninh Bình,11303,Huyện Vụ Bản,11303054,Xã Minh Tân
06,Tỉnh Ninh Bình,11303,Huyện Vụ Bản,11303055,Xã Hiển Khánh
06,Tỉnh Ninh Bình,11303,Huyện Vụ Bản,11303056,Xã Vụ Bản
06,Tỉnh Ninh Bình,11303,Huyện Vụ Bản,11303057,Xã Liên Minh
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307058,Xã Ý Yên
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307059,Xã Yên Đồng
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307060,Xã Yên Cường
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307061,Xã Vạn Thắng
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307062,Xã Vũ Dương
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307063,Xã Tân Minh
06,Tỉnh Ninh Bình,11307,Huyện Ý Yên,11307064,Xã Phong Doanh
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311065,Xã Cổ Lễ
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311066,Xã Ninh Giang
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311067,Xã Cát Thành
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311068,Xã Trực Ninh
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311069,Xã Quang Hưng
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311070,Xã Minh Thái
06,Tỉnh Ninh Bình,11311,Huyện Trực Ninh,11311071,Xã Ninh Cường
06,Tỉnh Ninh Bình,11313,Huyện Xuân Trường,11313072,Xã Xuân Trường
06,Tỉnh Ninh Bình,11313,Huyện Xuân Trường,11313073,Xã Xuân Hưng
06,Tỉnh Ninh Bình,11313,Huyện Xuân Trường,11313074,Xã Xuân Giang
06,Tỉnh Ninh Bình,11313,Huyện Xuân Trường,11313075,Xã Xuân Hồng
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319076,Xã Hải Hậu
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319077,Xã Hải Anh
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319078,Xã Hải Tiến
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319079,Xã Hải Hưng
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319080,Xã Hải An
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319081,Xã Hải Quang
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319082,Xã Hải Xuân
06,Tỉnh Ninh Bình,11319,Huyện Hải Hậu,11319083,Xã Hải Thịnh
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315084,Xã Giao Minh
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315085,Xã Giao Hoà
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315086,Xã Giao Thuỷ
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315087,Xã Giao Phúc
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315088,Xã Giao Hưng
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315089,Xã Giao Bình
06,Tỉnh Ninh Bình,11315,Huyện Giao Thuỷ,11315090,Xã Giao Ninh
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317091,Xã Đồng Thịnh
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317092,Xã Nghĩa Hưng
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317093,Xã Nghĩa Sơn
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317094,Xã Hồng Phong
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317095,Xã Quỹ Nhất
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317096,Xã Nghĩa Lâm
06,Tỉnh Ninh Bình,11317,Huyện Nghĩa Hưng,11317097,Xã Rạng Đông
06,Tỉnh Ninh Bình,11709,Thành phố Hoa Lư,11709098,Phường Tây Hoa Lư
06,Tỉnh Ninh Bình,11709,Thành phố Hoa Lư,11709099,Phường Hoa Lư
06,Tỉnh Ninh Bình,11709,Thành phố Hoa Lư,11709100,Phường Nam Hoa Lư
06,Tỉnh Ninh Bình,11713,Huyện Yên Khánh,11713101,Phường Đông Hoa Lư
06,Tỉnh Ninh Bình,11703,Thành phố Tam Điệp,11703102,Phường Tam Điệp
06,Tỉnh Ninh Bình,11703,Thành phố Tam Điệp,11703103,Phường Yên Sơn
06,Tỉnh Ninh Bình,11703,Thành phố Tam Điệp,11703104,Phường Trung Sơn
06,Tỉnh Ninh Bình,11703,Thành phố Tam Điệp,11703105,Phường Yên Thắng
06,Tỉnh Ninh Bình,11101,Thành phố Phủ Lý,11101106,Phường Hà Nam
06,Tỉnh Ninh Bình,11101,Thành phố Phủ Lý,11101107,Phường Phủ Lý
06,Tỉnh Ninh Bình,11101,Thành phố Phủ Lý,11101108,Phường Phù Vân
06,Tỉnh Ninh Bình,11101,Thành phố Phủ Lý,11101109,Phường Châu Sơn
06,Tỉnh Ninh Bình,11101,Thành phố Phủ Lý,11101110,Phường Liêm Tuyền
06,Tỉnh Ninh Bình,11103,Thị xã Duy Tiên,11103111,Phường Duy Tiên
06,Tỉnh Ninh Bình,11103,Thị xã Duy Tiên,11103112,Phường Duy Tân
06,Tỉnh Ninh Bình,11103,Thị xã Duy Tiên,11103113,Phường Đồng Văn
06,Tỉnh Ninh Bình,11103,Thị xã Duy Tiên,11103114,Phường Duy Hà
06,Tỉnh Ninh Bình,11103,Thị xã Duy Tiên,11103115,Phường Tiên Sơn
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105116,Phường Lê Hồ
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105117,Phường Nguyễn Úy
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105118,Phường Lý Thường Kiệt
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105119,Phường Kim Thanh
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105120,Phường Tam Chúc
06,Tỉnh Ninh Bình,11105,Thị xã Kim Bảng,11105121,Phường Kim Bảng
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301122,Phường Nam Định
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301123,Phường Thiên Trường
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301124,Phường Đông A
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301125,Phường Vị Khê
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301126,Phường Thành Nam
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301127,Phường Trường Thi
06,Tỉnh Ninh Bình,11309,Huyện Nam Trực,11309128,Phường Hồng Quang
06,Tỉnh Ninh Bình,11301,Thành phố Nam Định,11301129,Phường Mỹ Lộc
07,Tỉnh Cao Bằng,20301,Thành phố Cao Bằng,20301001,Phường Thục Phán
07,Tỉnh Cao Bằng,20301,Thành phố Cao Bằng,20301002,Phường Nùng Trí Cao
07,Tỉnh Cao Bằng,20301,Thành phố Cao Bằng,20301003,Phường Tân Giang
07,Tỉnh Cao Bằng,20323,Huyện Bảo Lâm,20323004,Xã Quảng Lâm
07,Tỉnh Cao Bằng,20323,Huyện Bảo Lâm,20323005,Xã Nam Quang
07,Tỉnh Cao Bằng,20323,Huyện Bảo Lâm,20323006,Xã Lý Bôn
07,Tỉnh Cao Bằng,20323,Huyện Bảo Lâm,20323007,Xã Bảo Lâm
07,Tỉnh Cao Bằng,20323,Huyện Bảo Lâm,20323008,Xã Yên Thổ
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303009,Xã Sơn Lộ
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303010,Xã Hưng Đạo
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303011,Xã Bảo Lạc
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303012,Xã Cốc Pàng
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303013,Xã Cô Ba
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303014,Xã Khánh Xuân
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303015,Xã Xuân Trường
07,Tỉnh Cao Bằng,20303,Huyện Bảo Lạc,20303016,Xã Huy Giáp
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313017,Xã Ca Thành
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313018,Xã Phan Thanh
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313019,Xã Thành Công
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313020,Xã Tĩnh Túc
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313021,Xã Tam Kim
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313022,Xã Nguyên Bình
07,Tỉnh Cao Bằng,20313,Huyện Nguyên Bình,20313023,Xã Minh Tâm
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305024,Xã Thanh Long
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305025,Xã Cần Yên
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305026,Xã Thông Nông
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305027,Xã Trường Hà
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305028,Xã Hà Quảng
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305029,Xã Lũng Nặm
07,Tỉnh Cao Bằng,20305,Huyện Hà Quảng,20305030,Xã Tổng Cọt
07,Tỉnh Cao Bằng,20315,Huyện Hoà An,20315031,Xã Nam Tuấn
07,Tỉnh Cao Bằng,20315,Huyện Hoà An,20315032,Xã Hoà An
07,Tỉnh Cao Bằng,20315,Huyện Hoà An,20315033,Xã Bạch Đằng
07,Tỉnh Cao Bằng,20315,Huyện Hoà An,20315034,Xã Nguyễn Huệ
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321035,Xã Minh Khai
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321036,Xã Canh Tân
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321037,Xã Kim Đồng
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321038,Xã Thạch An
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321039,Xã Đông Khê
07,Tỉnh Cao Bằng,20321,Huyện Thạch An,20321040,Xã Đức Long
07,Tỉnh Cao Bằng,20317,Huyện Quảng Hòa,20317041,Xã Phục Hoà
07,Tỉnh Cao Bằng,20317,Huyện Quảng Hòa,20317042,Xã Bế Văn Đàn
07,Tỉnh Cao Bằng,20317,Huyện Quảng Hòa,20317043,Xã Độc Lập
07,Tỉnh Cao Bằng,20317,Huyện Quảng Hòa,20317044,Xã Quảng Uyên
07,Tỉnh Cao Bằng,20317,Huyện Quảng Hòa,20317045,Xã Hạnh Phúc
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311046,Xã Quang Hán
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311047,Xã Trà Lĩnh
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311048,Xã Quang Trung
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311049,Xã Đoài Dương
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311050,Xã Trùng Khánh
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311051,Xã Đàm Thuỷ
07,Tỉnh Cao Bằng,20311,Huyện Trùng Khánh,20311052,Xã Đình Phong
07,Tỉnh Cao Bằng,20319,Huyện Hạ Lang,20319053,Xã Lý Quốc
07,Tỉnh Cao Bằng,20319,Huyện Hạ Lang,20319054,Xã Hạ Lang
07,Tỉnh Cao Bằng,20319,Huyện Hạ Lang,20319055,Xã Vinh Quý
07,Tỉnh Cao Bằng,20319,Huyện Hạ Lang,20319056,Xã Quang Long
08,Tỉnh Tuyên Quang,21113,Huyện Lâm Bình,21113001,Xã Thượng Lâm
08,Tỉnh Tuyên Quang,21113,Huyện Lâm Bình,21113002,Xã Lâm Bình
08,Tỉnh Tuyên Quang,21113,Huyện Lâm Bình,21113003,Xã Minh Quang
08,Tỉnh Tuyên Quang,21113,Huyện Lâm Bình,21113004,Xã Bình An
08,Tỉnh Tuyên Quang,21103,Huyện Na Hang,21103005,Xã Côn Lôn
08,Tỉnh Tuyên Quang,21103,Huyện Na Hang,21103006,Xã Yên Hoa
08,Tỉnh Tuyên Quang,21103,Huyện Na Hang,21103007,Xã Thượng Nông
08,Tỉnh Tuyên Quang,21103,Huyện Na Hang,21103008,Xã Hồng Thái
08,Tỉnh Tuyên Quang,21103,Huyện Na Hang,21103009,Xã Nà Hang
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105010,Xã Tân Mỹ
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105011,Xã Yên Lập
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105012,Xã Tân An
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105013,Xã Chiêm Hoá
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105014,Xã Hoà An
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105015,Xã Kiên Đài
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105016,Xã Tri Phú
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105017,Xã Kim Bình
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105018,Xã Yên Nguyên
08,Tỉnh Tuyên Quang,21105,Huyện Chiêm Hoá,21105019,Xã Trung Hà
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107020,Xã Yên Phú
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107021,Xã Bạch Xa
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107022,Xã Phù Lưu
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107023,Xã Hàm Yên
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107024,Xã Bình Xa
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107025,Xã Thái Sơn
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107026,Xã Thái Hoà
08,Tỉnh Tuyên Quang,21107,Huyện Hàm Yên,21107027,Xã Hùng Đức
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109028,Xã Hùng Lợi
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109029,Xã Trung Sơn
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109030,Xã Thái Bình
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109031,Xã Tân Long
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109032,Xã Xuân Vân
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109033,Xã Lực Hành
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109034,Xã Yên Sơn
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109035,Xã Nhữ Khê
08,Tỉnh Tuyên Quang,21109,Huyện Yên Sơn,21109036,Xã Kiến Thiết
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111037,Xã Tân Trào
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111038,Xã Minh Thanh
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111039,Xã Sơn Dương
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111040,Xã Bình Ca
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111041,Xã Tân Thanh
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111042,Xã Sơn Thuỷ
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111043,Xã Phú Lương
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111044,Xã Trường Sinh
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111045,Xã Hồng Sơn
08,Tỉnh Tuyên Quang,21111,Huyện Sơn Dương,21111046,Xã Đông Thọ
08,Tỉnh Tuyên Quang,21101,Thành phố Tuyên Quang,21101047,Phường Mỹ Lâm
08,Tỉnh Tuyên Quang,21101,Thành phố Tuyên Quang,21101048,Phường Minh Xuân
08,Tỉnh Tuyên Quang,21101,Thành phố Tuyên Quang,21101049,Phường Nông Tiến
08,Tỉnh Tuyên Quang,21101,Thành phố Tuyên Quang,21101050,Phường An Tường
08,Tỉnh Tuyên Quang,21101,Thành phố Tuyên Quang,21101051,Phường Bình Thuận
08,Tỉnh Tuyên Quang,20103,Huyện Đồng Văn,20103052,Xã Lũng Cú
08,Tỉnh Tuyên Quang,20103,Huyện Đồng Văn,20103053,Xã Đồng Văn
08,Tỉnh Tuyên Quang,20103,Huyện Đồng Văn,20103054,Xã Sà Phìn
08,Tỉnh Tuyên Quang,20103,Huyện Đồng Văn,20103055,Xã Phố Bảng
08,Tỉnh Tuyên Quang,20103,Huyện Đồng Văn,20103056,Xã Lũng Phìn
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105057,Xã Sủng Máng
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105058,Xã Sơn Vĩ
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105059,Xã Mèo Vạc
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105060,Xã Khâu Vai
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105061,Xã Niêm Sơn
08,Tỉnh Tuyên Quang,20105,Huyện Mèo Vạc,20105062,Xã Tát Ngà
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107063,Xã Thắng Mố
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107064,Xã Bạch Đích
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107065,Xã Yên Minh
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107066,Xã Mậu Duệ
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107067,Xã Ngọc Long
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107068,Xã Du Già
08,Tỉnh Tuyên Quang,20107,Huyện Yên Minh,20107069,Xã Đường Thượng
08,Tỉnh Tuyên Quang,20109,Huyện Quản Bạ,20109070,Xã Lùng Tám
08,Tỉnh Tuyên Quang,20109,Huyện Quản Bạ,20109071,Xã Cán Tỷ
08,Tỉnh Tuyên Quang,20109,Huyện Quản Bạ,20109072,Xã Nghĩa Thuận
08,Tỉnh Tuyên Quang,20109,Huyện Quản Bạ,20109073,Xã Quản Bạ
08,Tỉnh Tuyên Quang,20109,Huyện Quản Bạ,20109074,Xã Tùng Vài
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111075,Xã Yên Cường
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111076,Xã Đường Hồng
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111077,Xã Bắc Mê
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111078,Xã Giáp Trung
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111079,Xã Minh Sơn
08,Tỉnh Tuyên Quang,20111,Huyện Bắc Mê,20111080,Xã Minh Ngọc
08,Tỉnh Tuyên Quang,20101,Thành phố Hà Giang,20101081,Xã Ngọc Đường
08,Tỉnh Tuyên Quang,20101,Thành phố Hà Giang,20101082,Phường Hà Giang 1
08,Tỉnh Tuyên Quang,20101,Thành phố Hà Giang,20101083,Phường Hà Giang 2
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115084,Xã Lao Chải
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115085,Xã Thanh Thuỷ
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115086,Xã Minh Tân
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115087,Xã Thuận Hoà
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115088,Xã Tùng Bá
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115089,Xã Phú Linh
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115090,Xã Linh Hồ
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115091,Xã Bạch Ngọc
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115092,Xã Vị Xuyên
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115093,Xã Việt Lâm
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115094,Xã Cao Bồ
08,Tỉnh Tuyên Quang,20115,Huyện Vị Xuyên,20115095,Xã Thượng Sơn
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119096,Xã Tân Quang
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119097,Xã Đồng Tâm
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119098,Xã Liên Hiệp
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119099,Xã Bằng Hành
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119100,Xã Bắc Quang
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119101,Xã Hùng An
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119102,Xã Vĩnh Tuy
08,Tỉnh Tuyên Quang,20119,Huyện Bắc Quang,20119103,Xã Đồng Yên
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118104,Xã Tiên Yên
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118105,Xã Xuân Giang
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118106,Xã Bằng Lang
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118107,Xã Yên Thành
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118108,Xã Quang Bình
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118109,Xã Tân Trịnh
08,Tỉnh Tuyên Quang,20118,Huyện Quang Bình,20118110,Xã Tiên Nguyên
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113111,Xã Thông Nguyên
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113112,Xã Hồ Thầu
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113113,Xã Nậm Dịch
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113114,Xã Tân Tiến
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113115,Xã Hoàng Su Phì
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113116,Xã Thàng Tín
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113117,Xã Bản Máy
08,Tỉnh Tuyên Quang,20113,Huyện Hoàng Su Phì,20113118,Xã Pờ Ly Ngài
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117119,Xã Xín Mần
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117120,Xã Pà Vầy Sủ
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117121,Xã Nấm Dẩn
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117122,Xã Trung Thịnh
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117123,Xã Quảng Nguyên
08,Tỉnh Tuyên Quang,20117,Huyện Xín Mần,20117124,Xã Khuôn Lùng
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309001,Xã Khao Mang
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309002,Xã Mù Cang Chải
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309003,Xã Púng Luông
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315004,Xã Tú Lệ
09,Tỉnh Lào Cai,21317,Huyện Trạm Tấu,21317005,Xã Trạm Tấu
09,Tỉnh Lào Cai,21317,Huyện Trạm Tấu,21317006,Xã Hạnh Phúc
09,Tỉnh Lào Cai,21317,Huyện Trạm Tấu,21317007,Xã Phình Hồ
09,Tỉnh Lào Cai,21303,Thị xã Nghĩa Lộ,21303008,Phường Nghĩa Lộ
09,Tỉnh Lào Cai,21303,Thị xã Nghĩa Lộ,21303009,Phường Trung Tâm
09,Tỉnh Lào Cai,21303,Thị xã Nghĩa Lộ,21303010,Phường Cầu Thia
09,Tỉnh Lào Cai,21303,Thị xã Nghĩa Lộ,21303011,Xã Liên Sơn
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315012,Xã Gia Hội
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315013,Xã Sơn Lương
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315014,Xã Thượng Bằng La
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315015,Xã Chấn Thịnh
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315016,Xã Nghĩa Tâm
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315017,Xã Văn Chấn
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307018,Xã Phong Dụ Hạ
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307019,Xã Châu Quế
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307020,Xã Lâm Giang
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307021,Xã Đông Cuông
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307022,Xã Tân Hợp
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307023,Xã Mậu A
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307024,Xã Xuân Ái
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307025,Xã Mỏ Vàng
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305026,Xã Lâm Thượng
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305027,Xã Lục Yên
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305028,Xã Tân Lĩnh
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305029,Xã Khánh Hoà
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305030,Xã Phúc Lợi
09,Tỉnh Lào Cai,21305,Huyện Lục Yên,21305031,Xã Mường Lai
09,Tỉnh Lào Cai,21313,Huyện Yên Bình,21313032,Xã Cảm Nhân
09,Tỉnh Lào Cai,21313,Huyện Yên Bình,21313033,Xã Yên Thành
09,Tỉnh Lào Cai,21313,Huyện Yên Bình,21313034,Xã Thác Bà
09,Tỉnh Lào Cai,21313,Huyện Yên Bình,21313035,Xã Yên Bình
09,Tỉnh Lào Cai,21313,Huyện Yên Bình,21313036,Xã Bảo Ái
09,Tỉnh Lào Cai,21301,Thành phố Yên Bái,21301037,Phường Văn Phú
09,Tỉnh Lào Cai,21301,Thành phố Yên Bái,21301038,Phường Yên Bái
09,Tỉnh Lào Cai,21301,Thành phố Yên Bái,21301039,Phường Nam Cường
09,Tỉnh Lào Cai,21301,Thành phố Yên Bái,21301040,Phường Âu Lâu
09,Tỉnh Lào Cai,21311,Huyện Trấn Yên,21311041,Xã Trấn Yên
09,Tỉnh Lào Cai,21311,Huyện Trấn Yên,21311042,Xã Hưng Khánh
09,Tỉnh Lào Cai,21311,Huyện Trấn Yên,21311043,Xã Lương Thịnh
09,Tỉnh Lào Cai,21311,Huyện Trấn Yên,21311044,Xã Việt Hồng
09,Tỉnh Lào Cai,21311,Huyện Trấn Yên,21311045,Xã Quy Mông
09,Tỉnh Lào Cai,20511,Huyện Bảo Thắng,20511046,Xã Phong Hải
09,Tỉnh Lào Cai,20511,Huyện Bảo Thắng,20511047,Xã Xuân Quang
09,Tỉnh Lào Cai,20511,Huyện Bảo Thắng,20511048,Xã Bảo Thắng
09,Tỉnh Lào Cai,20511,Huyện Bảo Thắng,20511049,Xã Tằng Lỏong
09,Tỉnh Lào Cai,20511,Huyện Bảo Thắng,20511050,Xã Gia Phú
09,Tỉnh Lào Cai,20501,Thành phố Lào Cai,20501051,Xã Cốc San
09,Tỉnh Lào Cai,20501,Thành phố Lào Cai,20501052,Xã Hợp Thành
09,Tỉnh Lào Cai,20501,Thành phố Lào Cai,20501053,Phường Cam Đường
09,Tỉnh Lào Cai,20501,Thành phố Lào Cai,20501054,Phường Lào Cai
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507055,Xã Mường Hum
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507056,Xã Dền Sáng
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507057,Xã Y Tý
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507058,Xã A Mú Sung
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507059,Xã Trịnh Tường
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507060,Xã Bản Xèo
09,Tỉnh Lào Cai,20507,Huyện Bát Xát,20507061,Xã Bát Xát
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515062,Xã Nghĩa Đô
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515063,Xã Thượng Hà
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515064,Xã Bảo Yên
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515065,Xã Xuân Hoà
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515066,Xã Phúc Khánh
09,Tỉnh Lào Cai,20515,Huyện Bảo Yên,20515067,Xã Bảo Hà
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519068,Xã Võ Lao
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519069,Xã Khánh Yên
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519070,Xã Văn Bàn
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519071,Xã Dương Quỳ
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519072,Xã Chiềng Ken
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519073,Xã Minh Lương
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519074,Xã Nậm Chày
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513075,Xã Mường Bo
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513076,Xã Bản Hồ
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513077,Xã Tả Phìn
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513078,Xã Tả Van
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513079,Phường Sa Pa
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509080,Xã Cốc Lầu
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509081,Xã Bảo Nhai
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509082,Xã Bản Liền
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509083,Xã Bắc Hà
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509084,Xã Tả Củ Tỷ
09,Tỉnh Lào Cai,20509,Huyện Bắc Hà,20509085,Xã Lùng Phình
09,Tỉnh Lào Cai,20505,Huyện Mường Khương,20505086,Xã Pha Long
09,Tỉnh Lào Cai,20505,Huyện Mường Khương,20505087,Xã Mường Khương
09,Tỉnh Lào Cai,20505,Huyện Mường Khương,20505088,Xã Bản Lầu
09,Tỉnh Lào Cai,20505,Huyện Mường Khương,20505089,Xã Cao Sơn
09,Tỉnh Lào Cai,20521,Huyện Si Ma Cai,20521090,Xã Si Ma Cai
09,Tỉnh Lào Cai,20521,Huyện Si Ma Cai,20521091,Xã Sín Chéng
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309092,Xã Lao Chải
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309093,Xã Chế Tạo
09,Tỉnh Lào Cai,21309,Huyện Mù Cang Chải,21309094,Xã Nậm Có
09,Tỉnh Lào Cai,21317,Huyện Trạm Tấu,21317095,Xã Tà Xi Láng
09,Tỉnh Lào Cai,21307,Huyện Văn Yên,21307096,Xã Phong Dụ Thượng
09,Tỉnh Lào Cai,21315,Huyện Văn Chấn,21315097,Xã Cát Thịnh
09,Tỉnh Lào Cai,20519,Huyện Văn Bàn,20519098,Xã Nậm Xé
09,Tỉnh Lào Cai,20513,Thị xã Sa Pa,20513099,Xã Ngũ Chỉ Sơn
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501001,Phường Phan Đình Phùng
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501002,Phường Linh Sơn
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501003,Phường Tích Lương
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501004,Phường Gia Sàng
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501005,Phường Quyết Thắng
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501006,Phường Quan Triều
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501007,Xã Tân Cương
10,Tỉnh Thái Nguyên,21501,Thành phố Thái Nguyên,21501008,Xã Đại Phúc
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513009,Xã Đại Từ
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513010,Xã Đức Lương
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513011,Xã Phú Thịnh
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513012,Xã La Bằng
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513013,Xã Phú Lạc
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513014,Xã An Khánh
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513015,Xã Quân Chu
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513016,Xã Vạn Phú
10,Tỉnh Thái Nguyên,21513,Huyện Đại Từ,21513017,Xã Phú Xuyên
10,Tỉnh Thái Nguyên,21517,Thành phố Phổ Yên,21517018,Phường Phổ Yên
10,Tỉnh Thái Nguyên,21517,Thành phố Phổ Yên,21517019,Phường Vạn Xuân
10,Tỉnh Thái Nguyên,21517,Thành phố Phổ Yên,21517020,Phường Trung Thành
10,Tỉnh Thái Nguyên,21517,Thành phố Phổ Yên,21517021,Phường Phúc Thuận
10,Tỉnh Thái Nguyên,21517,Thành phố Phổ Yên,21517022,Xã Thành Công
10,Tỉnh Thái Nguyên,21515,Huyện Phú Bình,21515023,Xã Phú Bình
10,Tỉnh Thái Nguyên,21515,Huyện Phú Bình,21515024,Xã Tân Thành
10,Tỉnh Thái Nguyên,21515,Huyện Phú Bình,21515025,Xã Điềm Thụy
10,Tỉnh Thái Nguyên,21515,Huyện Phú Bình,21515026,Xã Kha Sơn
10,Tỉnh Thái Nguyên,21515,Huyện Phú Bình,21515027,Xã Tân Khánh
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511028,Xã Đồng Hỷ
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511029,Xã Quang Sơn
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511030,Xã Trại Cau
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511031,Xã Nam Hoà
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511032,Xã Văn Hán
10,Tỉnh Thái Nguyên,21511,Huyện Đồng Hỷ,21511033,Xã Văn Lăng
10,Tỉnh Thái Nguyên,21503,Thành phố Sông Công,21503034,Phường Sông Công
10,Tỉnh Thái Nguyên,21503,Thành phố Sông Công,21503035,Phường Bá Xuyên
10,Tỉnh Thái Nguyên,21503,Thành phố Sông Công,21503036,Phường Bách Quang
10,Tỉnh Thái Nguyên,21509,Huyện Phú Lương,21509037,Xã Phú Lương
10,Tỉnh Thái Nguyên,21509,Huyện Phú Lương,21509038,Xã Vô Tranh
10,Tỉnh Thái Nguyên,21509,Huyện Phú Lương,21509039,Xã Yên Trạch
10,Tỉnh Thái Nguyên,21509,Huyện Phú Lương,21509040,Xã Hợp Thành
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505041,Xã Định Hóa
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505042,Xã Bình Yên
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505043,Xã Trung Hội
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505044,Xã Phượng Tiến
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505045,Xã Phú Đình
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505046,Xã Bình Thành
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505047,Xã Kim Phượng
10,Tỉnh Thái Nguyên,21505,Huyện Định Hoá,21505048,Xã Lam Vỹ
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507049,Xã Võ Nhai
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507050,Xã Dân Tiến
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507051,Xã Nghinh Tường
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507052,Xã Thần Sa
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507053,Xã La Hiên
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507054,Xã Tràng Xá
10,Tỉnh Thái Nguyên,20704,Huyện Pác Nặm,20704055,Xã Bằng Thành
10,Tỉnh Thái Nguyên,20704,Huyện Pác Nặm,20704056,Xã Nghiên Loan
10,Tỉnh Thái Nguyên,20704,Huyện Pác Nặm,20704057,Xã Cao Minh
10,Tỉnh Thái Nguyên,20703,Huyện Ba Bể,20703058,Xã Ba Bể
10,Tỉnh Thái Nguyên,20703,Huyện Ba Bể,20703059,Xã Chợ Rã
10,Tỉnh Thái Nguyên,20703,Huyện Ba Bể,20703060,Xã Phúc Lộc
10,Tỉnh Thái Nguyên,20703,Huyện Ba Bể,20703061,Xã Thượng Minh
10,Tỉnh Thái Nguyên,20703,Huyện Ba Bể,20703062,Xã Đồng Phúc
10,Tỉnh Thái Nguyên,20713,Huyện Chợ Mới,20713063,Xã Yên Bình
10,Tỉnh Thái Nguyên,20705,Huyện Ngân Sơn,20705064,Xã Bằng Vân
10,Tỉnh Thái Nguyên,20705,Huyện Ngân Sơn,20705065,Xã Ngân Sơn
10,Tỉnh Thái Nguyên,20705,Huyện Ngân Sơn,20705066,Xã Nà Phặc
10,Tỉnh Thái Nguyên,20705,Huyện Ngân Sơn,20705067,Xã Hiệp Lực
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707068,Xã Nam Cường
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707069,Xã Quảng Bạch
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707070,Xã Yên Thịnh
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707071,Xã Chợ Đồn
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707072,Xã Yên Phong
10,Tỉnh Thái Nguyên,20707,Huyện Chợ Đồn,20707073,Xã Nghĩa Tá
10,Tỉnh Thái Nguyên,20711,Huyện Bạch Thông,20711074,Xã Phủ Thông
10,Tỉnh Thái Nguyên,20711,Huyện Bạch Thông,20711075,Xã Cẩm Giàng
10,Tỉnh Thái Nguyên,20711,Huyện Bạch Thông,20711076,Xã Vĩnh Thông
10,Tỉnh Thái Nguyên,20711,Huyện Bạch Thông,20711077,Xã Bạch Thông
10,Tỉnh Thái Nguyên,20701,Thành phố Bắc Kạn,20701078,Xã Phong Quang
10,Tỉnh Thái Nguyên,20701,Thành phố Bắc Kạn,20701079,Phường Đức Xuân
10,Tỉnh Thái Nguyên,20701,Thành phố Bắc Kạn,20701080,Phường Bắc Kạn
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709081,Xã Văn Lang
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709082,Xã Cường Lợi
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709083,Xã Na Rì
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709084,Xã Trần Phú
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709085,Xã Côn Minh
10,Tỉnh Thái Nguyên,20709,Huyện Na Rì,20709086,Xã Xuân Dương
10,Tỉnh Thái Nguyên,20713,Huyện Chợ Mới,20713087,Xã Tân Kỳ
10,Tỉnh Thái Nguyên,20713,Huyện Chợ Mới,20713088,Xã Thanh Mai
10,Tỉnh Thái Nguyên,20713,Huyện Chợ Mới,20713089,Xã Thanh Thịnh
10,Tỉnh Thái Nguyên,20713,Huyện Chợ Mới,20713090,Xã Chợ Mới
10,Tỉnh Thái Nguyên,21507,Huyện Võ Nhai,21507091,Xã Sảng Mộc
10,Tỉnh Thái Nguyên,20705,Huyện Ngân Sơn,20705092,Xã Thượng Quan
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903001,Xã Thất Khê
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903002,Xã Đoàn Kết
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903003,Xã Tân Tiến
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903004,Xã Tràng Định
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903005,Xã Quốc Khánh
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903006,Xã Kháng Chiến
11,Tỉnh Lạng Sơn,20903,Huyện Tràng Định,20903007,Xã Quốc Việt
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907008,Xã Bình Gia
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907009,Xã Tân Văn
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907010,Xã Hồng Phong
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907011,Xã Hoa Thám
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907012,Xã Quý Hoà
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907013,Xã Thiện Hoà
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907014,Xã Thiện Thuật
11,Tỉnh Lạng Sơn,20907,Huyện Bình Gia,20907015,Xã Thiện Long
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909016,Xã Bắc Sơn
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909017,Xã Hưng Vũ
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909018,Xã Vũ Lăng
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909019,Xã Nhất Hoà
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909020,Xã Vũ Lễ
11,Tỉnh Lạng Sơn,20909,Huyện Bắc Sơn,20909021,Xã Tân Tri
11,Tỉnh Lạng Sơn,20911,Huyện Văn Quan,20911022,Xã Văn Quan
11,Tỉnh Lạng Sơn,20911,Huyện Văn Quan,20911023,Xã Điềm He
11,Tỉnh Lạng Sơn,20911,Huyện Văn Quan,20911024,Xã Tri Lễ
11,Tỉnh Lạng Sơn,20911,Huyện Văn Quan,20911025,Xã Yên Phúc
11,Tỉnh Lạng Sơn,20911,Huyện Văn Quan,20911026,Xã Tân Đoàn
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913027,Xã Khánh Khê
11,Tỉnh Lạng Sơn,20905,Huyện Văn Lãng,20905028,Xã Na Sầm
11,Tỉnh Lạng Sơn,20905,Huyện Văn Lãng,20905029,Xã Văn Lãng
11,Tỉnh Lạng Sơn,20905,Huyện Văn Lãng,20905030,Xã Hội Hoan
11,Tỉnh Lạng Sơn,20905,Huyện Văn Lãng,20905031,Xã Thụy Hùng
11,Tỉnh Lạng Sơn,20905,Huyện Văn Lãng,20905032,Xã Hoàng Văn Thụ
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915033,Xã Lộc Bình
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915034,Xã Mẫu Sơn
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915035,Xã Na Dương
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915036,Xã Lợi Bác
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915037,Xã Thống Nhất
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915038,Xã Xuân Dương
11,Tỉnh Lạng Sơn,20915,Huyện Lộc Bình,20915039,Xã Khuất Xá
11,Tỉnh Lạng Sơn,20919,Huyện Đình Lập,20919040,Xã Đình Lập
11,Tỉnh Lạng Sơn,20919,Huyện Đình Lập,20919041,Xã Châu Sơn
11,Tỉnh Lạng Sơn,20919,Huyện Đình Lập,20919042,Xã Kiên Mộc
11,Tỉnh Lạng Sơn,20919,Huyện Đình Lập,20919043,Xã Thái Bình
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921044,Xã Hữu Lũng
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921045,Xã Tuấn Sơn
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921046,Xã Tân Thành
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921047,Xã Vân Nham
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921048,Xã Thiện Tân
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921049,Xã Yên Bình
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921050,Xã Hữu Liên
11,Tỉnh Lạng Sơn,20921,Huyện Hữu Lũng,20921051,Xã Cai Kinh
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917052,Xã Chi Lăng
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917053,Xã Nhân Lý
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917054,Xã Chiến Thắng
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917055,Xã Quan Sơn
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917056,Xã Bằng Mạc
11,Tỉnh Lạng Sơn,20917,Huyện Chi Lăng,20917057,Xã Vạn Linh
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913058,Xã Đồng Đăng
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913059,Xã Cao Lộc
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913060,Xã Công Sơn
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913061,Xã Ba Sơn
11,Tỉnh Lạng Sơn,20901,Thành phố Lạng Sơn,20901062,Phường Tam Thanh
11,Tỉnh Lạng Sơn,20901,Thành phố Lạng Sơn,20901063,Phường Lương Văn Tri
11,Tỉnh Lạng Sơn,20913,Huyện Cao Lộc,20913064,Phường Kỳ Lừa
11,Tỉnh Lạng Sơn,20901,Thành phố Lạng Sơn,20901065,Phường Đông Kinh
12,Tỉnh Phú Thọ,21701,Thành phố Việt Trì,21701001,Phường Việt Trì
12,Tỉnh Phú Thọ,21701,Thành phố Việt Trì,21701002,Phường Nông Trang
12,Tỉnh Phú Thọ,21701,Thành phố Việt Trì,21701003,Phường Thanh Miếu
12,Tỉnh Phú Thọ,21701,Thành phố Việt Trì,21701004,Phường Vân Phú
12,Tỉnh Phú Thọ,21701,Thành phố Việt Trì,21701005,Xã Hy Cương
12,Tỉnh Phú Thọ,21721,Huyện Lâm Thao,21721006,Xã Lâm Thao
12,Tỉnh Phú Thọ,21721,Huyện Lâm Thao,21721007,Xã Xuân Lũng
12,Tỉnh Phú Thọ,21721,Huyện Lâm Thao,21721008,Xã Phùng Nguyên
12,Tỉnh Phú Thọ,21721,Huyện Lâm Thao,21721009,Xã Bản Nguyên
12,Tỉnh Phú Thọ,21703,Thị xã Phú Thọ,21703010,Phường Phong Châu
12,Tỉnh Phú Thọ,21703,Thị xã Phú Thọ,21703011,Phường Phú Thọ
12,Tỉnh Phú Thọ,21703,Thị xã Phú Thọ,21703012,Phường Âu Cơ
12,Tỉnh Phú Thọ,21711,Huyện Phù Ninh,21711013,Xã Phù Ninh
12,Tỉnh Phú Thọ,21711,Huyện Phù Ninh,21711014,Xã Dân Chủ
12,Tỉnh Phú Thọ,21711,Huyện Phù Ninh,21711015,Xã Phú Mỹ
12,Tỉnh Phú Thọ,21711,Huyện Phù Ninh,21711016,Xã Trạm Thản
12,Tỉnh Phú Thọ,21711,Huyện Phù Ninh,21711017,Xã Bình Phú
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709018,Xã Thanh Ba
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709019,Xã Quảng Yên
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709020,Xã Hoàng Cương
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709021,Xã Đông Thành
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709022,Xã Chí Tiên
12,Tỉnh Phú Thọ,21709,Huyện Thanh Ba,21709023,Xã Liên Minh
12,Tỉnh Phú Thọ,21705,Huyện Đoan Hùng,21705024,Xã Đoan Hùng
12,Tỉnh Phú Thọ,21705,Huyện Đoan Hùng,21705025,Xã Tây Cốc
12,Tỉnh Phú Thọ,21705,Huyện Đoan Hùng,21705026,Xã Chân Mộng
12,Tỉnh Phú Thọ,21705,Huyện Đoan Hùng,21705027,Xã Chí Đám
12,Tỉnh Phú Thọ,21705,Huyện Đoan Hùng,21705028,Xã Bằng Luân
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707029,Xã Hạ Hòa
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707030,Xã Đan Thượng
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707031,Xã Yên Kỳ
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707032,Xã Vĩnh Chân
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707033,Xã Văn Lang
12,Tỉnh Phú Thọ,21707,Huyện Hạ Hoà,21707034,Xã Hiền Lương
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713035,Xã Cẩm Khê
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713036,Xã Phú Khê
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713037,Xã Hùng Việt
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713038,Xã Đồng Lương
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713039,Xã Tiên Lương
12,Tỉnh Phú Thọ,21713,Huyện Cẩm Khê,21713040,Xã Vân Bán
12,Tỉnh Phú Thọ,21717,Huyện Tam Nông,21717041,Xã Tam Nông
12,Tỉnh Phú Thọ,21717,Huyện Tam Nông,21717042,Xã Thọ Văn
12,Tỉnh Phú Thọ,21717,Huyện Tam Nông,21717043,Xã Vạn Xuân
12,Tỉnh Phú Thọ,21717,Huyện Tam Nông,21717044,Xã Hiền Quan
12,Tỉnh Phú Thọ,21723,Huyện Thanh Thuỷ,21723045,Xã Thanh Thuỷ
12,Tỉnh Phú Thọ,21723,Huyện Thanh Thuỷ,21723046,Xã Đào Xá
12,Tỉnh Phú Thọ,21723,Huyện Thanh Thuỷ,21723047,Xã Tu Vũ
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719048,Xã Thanh Sơn
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719049,Xã Võ Miếu
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719050,Xã Văn Miếu
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719051,Xã Cự Đồng
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719052,Xã Hương Cần
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719053,Xã Yên Sơn
12,Tỉnh Phú Thọ,21719,Huyện Thanh Sơn,21719054,Xã Khả Cửu
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720055,Xã Tân Sơn
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720056,Xã Minh Đài
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720057,Xã Lai Đồng
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720058,Xã Thu Cúc
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720059,Xã Xuân Đài
12,Tỉnh Phú Thọ,21720,Huyện Tân Sơn,21720060,Xã Long Cốc
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715061,Xã Yên Lập
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715062,Xã Thượng Long
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715063,Xã Sơn Lương
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715064,Xã Xuân Viên
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715065,Xã Minh Hòa
12,Tỉnh Phú Thọ,21715,Huyện Yên Lập,21715066,Xã Trung Sơn
12,Tỉnh Phú Thọ,21915,Huyện Sông Lô,21915067,Xã Tam Sơn
12,Tỉnh Phú Thọ,21915,Huyện Sông Lô,21915068,Xã Sông Lô
12,Tỉnh Phú Thọ,21915,Huyện Sông Lô,21915069,Xã Hải Lựu
12,Tỉnh Phú Thọ,21915,Huyện Sông Lô,21915070,Xã Yên Lãng
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903071,Xã Lập Thạch
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903072,Xã Tiên Lữ
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903073,Xã Thái Hòa
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903074,Xã Liên Hòa
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903075,Xã Hợp Lý
12,Tỉnh Phú Thọ,21903,Huyện Lập Thạch,21903076,Xã Sơn Đông
12,Tỉnh Phú Thọ,21904,Huyện Tam Đảo,21904077,Xã Tam Đảo
12,Tỉnh Phú Thọ,21904,Huyện Tam Đảo,21904078,Xã Đại Đình
12,Tỉnh Phú Thọ,21904,Huyện Tam Đảo,21904079,Xã Đạo Trù
12,Tỉnh Phú Thọ,21905,Huyện Tam Dương,21905080,Xã Tam Dương
12,Tỉnh Phú Thọ,21905,Huyện Tam Dương,21905081,Xã Hội Thịnh
12,Tỉnh Phú Thọ,21905,Huyện Tam Dương,21905082,Xã Hoàng An
12,Tỉnh Phú Thọ,21905,Huyện Tam Dương,21905083,Xã Tam Dương Bắc
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907084,Xã Vĩnh Tường
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907085,Xã Thổ Tang
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907086,Xã Vĩnh Hưng
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907087,Xã Vĩnh An
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907088,Xã Vĩnh Phú
12,Tỉnh Phú Thọ,21907,Huyện Vĩnh Tường,21907089,Xã Vĩnh Thành
12,Tỉnh Phú Thọ,21909,Huyện Yên Lạc,21909090,Xã Yên Lạc
12,Tỉnh Phú Thọ,21909,Huyện Yên Lạc,21909091,Xã Tề Lỗ
12,Tỉnh Phú Thọ,21909,Huyện Yên Lạc,21909092,Xã Liên Châu
12,Tỉnh Phú Thọ,21909,Huyện Yên Lạc,21909093,Xã Tam Hồng
12,Tỉnh Phú Thọ,21909,Huyện Yên Lạc,21909094,Xã Nguyệt Đức
12,Tỉnh Phú Thọ,21913,Huyện Bình Xuyên,21913095,Xã Bình Nguyên
12,Tỉnh Phú Thọ,21913,Huyện Bình Xuyên,21913096,Xã Xuân Lãng
12,Tỉnh Phú Thọ,21913,Huyện Bình Xuyên,21913097,Xã Bình Xuyên
12,Tỉnh Phú Thọ,21913,Huyện Bình Xuyên,21913098,Xã Bình Tuyền
12,Tỉnh Phú Thọ,21901,Thành phố Vĩnh Yên,21901099,Phường Vĩnh Phúc
12,Tỉnh Phú Thọ,21901,Thành phố Vĩnh Yên,21901100,Phường Vĩnh Yên
12,Tỉnh Phú Thọ,21902,Thành phố Phúc Yên,21902101,Phường Phúc Yên
12,Tỉnh Phú Thọ,21902,Thành phố Phúc Yên,21902102,Phường Xuân Hòa
12,Tỉnh Phú Thọ,30510,Huyện Cao Phong,30510103,Xã Cao Phong
12,Tỉnh Phú Thọ,30510,Huyện Cao Phong,30510104,Xã Mường Thàng
12,Tỉnh Phú Thọ,30510,Huyện Cao Phong,30510105,Xã Thung Nai
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503106,Xã Đà Bắc
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503107,Xã Cao Sơn
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503108,Xã Đức Nhàn
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503109,Xã Quy Đức
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503110,Xã Tân Pheo
12,Tỉnh Phú Thọ,30503,Huyện Đà Bắc,30503111,Xã Tiền Phong
12,Tỉnh Phú Thọ,30511,Huyện Kim Bôi,30511112,Xã Kim Bôi
12,Tỉnh Phú Thọ,30511,Huyện Kim Bôi,30511113,Xã Mường Động
12,Tỉnh Phú Thọ,30511,Huyện Kim Bôi,30511114,Xã Dũng Tiến
12,Tỉnh Phú Thọ,30511,Huyện Kim Bôi,30511115,Xã Hợp Kim
12,Tỉnh Phú Thọ,30511,Huyện Kim Bôi,30511116,Xã Nật Sơn
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515117,Xã Lạc Sơn
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515118,Xã Mường Vang
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515119,Xã Đại Đồng
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515120,Xã Ngọc Sơn
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515121,Xã Nhân Nghĩa
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515122,Xã Quyết Thắng
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515123,Xã Thượng Cốc
12,Tỉnh Phú Thọ,30515,Huyện Lạc Sơn,30515124,Xã Yên Phú
12,Tỉnh Phú Thọ,30517,Huyện Lạc Thuỷ,30517125,Xã Lạc Thủy
12,Tỉnh Phú Thọ,30517,Huyện Lạc Thuỷ,30517126,Xã An Bình
12,Tỉnh Phú Thọ,30517,Huyện Lạc Thuỷ,30517127,Xã An Nghĩa
12,Tỉnh Phú Thọ,30509,Huyện Lương Sơn,30509128,Xã Lương Sơn
12,Tỉnh Phú Thọ,30509,Huyện Lương Sơn,30509129,Xã Cao Dương
12,Tỉnh Phú Thọ,30509,Huyện Lương Sơn,30509130,Xã Liên Sơn
12,Tỉnh Phú Thọ,30505,Huyện Mai Châu,30505131,Xã Mai Châu
12,Tỉnh Phú Thọ,30505,Huyện Mai Châu,30505132,Xã Bao La
12,Tỉnh Phú Thọ,30505,Huyện Mai Châu,30505133,Xã Mai Hạ
12,Tỉnh Phú Thọ,30505,Huyện Mai Châu,30505134,Xã Pà Cò
12,Tỉnh Phú Thọ,30505,Huyện Mai Châu,30505135,Xã Tân Mai
12,Tỉnh Phú Thọ,30513,Huyện Tân Lạc,30513136,Xã Tân Lạc
12,Tỉnh Phú Thọ,30513,Huyện Tân Lạc,30513137,Xã Mường Bi
12,Tỉnh Phú Thọ,30513,Huyện Tân Lạc,30513138,Xã Mường Hoa
12,Tỉnh Phú Thọ,30513,Huyện Tân Lạc,30513139,Xã Toàn Thắng
12,Tỉnh Phú Thọ,30513,Huyện Tân Lạc,30513140,Xã Vân Sơn
12,Tỉnh Phú Thọ,30519,Huyện Yên Thuỷ,30519141,Xã Yên Thủy
12,Tỉnh Phú Thọ,30519,Huyện Yên Thuỷ,30519142,Xã Lạc Lương
12,Tỉnh Phú Thọ,30519,Huyện Yên Thuỷ,30519143,Xã Yên Trị
12,Tỉnh Phú Thọ,30501,Thành phố Hoà Bình,30501144,Xã Thịnh Minh
12,Tỉnh Phú Thọ,30501,Thành phố Hoà Bình,30501145,Phường Hoà Bình
12,Tỉnh Phú Thọ,30501,Thành phố Hoà Bình,30501146,Phường Kỳ Sơn
12,Tỉnh Phú Thọ,30501,Thành phố Hoà Bình,30501147,Phường Tân Hoà
12,Tỉnh Phú Thọ,30501,Thành phố Hoà Bình,30501148,Phường Thống Nhất
13,Tỉnh Điện Biên,30101,TP.Điện Biên Phủ,30101001,Xã Mường Phăng
13,Tỉnh Điện Biên,30101,TP.Điện Biên Phủ,30101002,Phường Điện Biên Phủ
13,Tỉnh Điện Biên,30101,TP.Điện Biên Phủ,30101003,Phường Mường Thanh
13,Tỉnh Điện Biên,30103,Thị xã Mường Lay,30103004,Phường Mường Lay
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117005,Xã Thanh Nưa
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117006,Xã Thanh An
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117007,Xã Thanh Yên
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117008,Xã Sam Mứn
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117009,Xã Núa Ngam
13,Tỉnh Điện Biên,30117,Huyện Điện Biên,30117010,Xã Mường Nhà
13,Tỉnh Điện Biên,30115,Huyện Tuần Giáo,30115011,Xã Tuần Giáo
13,Tỉnh Điện Biên,30115,Huyện Tuần Giáo,30115012,Xã Quài Tở
13,Tỉnh Điện Biên,30115,Huyện Tuần Giáo,30115013,Xã Mường Mùn
13,Tỉnh Điện Biên,30115,Huyện Tuần Giáo,30115014,Xã Pú Nhung
13,Tỉnh Điện Biên,30115,Huyện Tuần Giáo,30115015,Xã Chiềng Sinh
13,Tỉnh Điện Biên,30113,Huyện Tủa Chùa,30113016,Xã Tủa Chùa
13,Tỉnh Điện Biên,30113,Huyện Tủa Chùa,30113017,Xã Sín Chải
13,Tỉnh Điện Biên,30113,Huyện Tủa Chùa,30113018,Xã Sính Phình
13,Tỉnh Điện Biên,30113,Huyện Tủa Chùa,30113019,Xã Tủa Thàng
13,Tỉnh Điện Biên,30113,Huyện Tủa Chùa,30113020,Xã Sáng Nhè
13,Tỉnh Điện Biên,30111,Huyện Mường Chà,30111021,Xã Na Sang
13,Tỉnh Điện Biên,30111,Huyện Mường Chà,30111022,Xã Mường Tùng
13,Tỉnh Điện Biên,30111,Huyện Mường Chà,30111023,Xã Pa Ham
13,Tỉnh Điện Biên,30111,Huyện Mường Chà,30111024,Xã Nậm Nèn
13,Tỉnh Điện Biên,30111,Huyện Mường Chà,30111025,Xã Mường Pồn
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119026,Xã Na Son
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119027,Xã Xa Dung
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119028,Xã Pu Nhi
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119029,Xã Mường Luân
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119030,Xã Tìa Dình
13,Tỉnh Điện Biên,30119,Huyện Điện Biên Đông,30119031,Xã Phình Giàng
13,Tỉnh Điện Biên,30123,Huyện Nậm Pồ,30123032,Xã Mường Chà
13,Tỉnh Điện Biên,30123,Huyện Nậm Pồ,30123033,Xã Nà Hỳ
13,Tỉnh Điện Biên,30123,Huyện Nậm Pồ,30123034,Xã Nà Bủng
13,Tỉnh Điện Biên,30123,Huyện Nậm Pồ,30123035,Xã Chà Tở
13,Tỉnh Điện Biên,30123,Huyện Nậm Pồ,30123036,Xã Si Pa Phìn
13,Tỉnh Điện Biên,30104,Huyện Mường Nhé,30104037,Xã Mường Nhé
13,Tỉnh Điện Biên,30104,Huyện Mường Nhé,30104038,Xã Sín Thầu
13,Tỉnh Điện Biên,30104,Huyện Mường Nhé,30104039,Xã Mường Toong
13,Tỉnh Điện Biên,30104,Huyện Mường Nhé,30104040,Xã Nậm Kè
13,Tỉnh Điện Biên,30104,Huyện Mường Nhé,30104041,Xã Quảng Lâm
13,Tỉnh Điện Biên,30121,Huyện Mường Ảng,30121042,Xã Mường Ảng
13,Tỉnh Điện Biên,30121,Huyện Mường Ảng,30121043,Xã Nà Tấu
13,Tỉnh Điện Biên,30121,Huyện Mường Ảng,30121044,Xã Búng Lao
13,Tỉnh Điện Biên,30121,Huyện Mường Ảng,30121045,Xã Mường Lạn
14,Tỉnh Lai Châu,30209,Huyện Than Uyên,30209001,Xã Mường Kim
14,Tỉnh Lai Châu,30209,Huyện Than Uyên,30209002,Xã Khoen On
14,Tỉnh Lai Châu,30209,Huyện Than Uyên,30209003,Xã Than Uyên
14,Tỉnh Lai Châu,30209,Huyện Than Uyên,30209004,Xã Mường Than
14,Tỉnh Lai Châu,30211,Huyện Tân Uyên,30211005,Xã Pắc Ta
14,Tỉnh Lai Châu,30211,Huyện Tân Uyên,30211006,Xã Nậm Sỏ
14,Tỉnh Lai Châu,30211,Huyện Tân Uyên,30211007,Xã Tân Uyên
14,Tỉnh Lai Châu,30211,Huyện Tân Uyên,30211008,Xã Mường Khoa
14,Tỉnh Lai Châu,30205,Huyện Tam Đường,30205009,Xã Bản Bo
14,Tỉnh Lai Châu,30205,Huyện Tam Đường,30205010,Xã Bình Lư
14,Tỉnh Lai Châu,30205,Huyện Tam Đường,30205011,Xã Tả Lèng
14,Tỉnh Lai Châu,30205,Huyện Tam Đường,30205012,Xã Khun Há
14,Tỉnh Lai Châu,30202,Thành phố Lai Châu,30202013,Phường Tân Phong
14,Tỉnh Lai Châu,30202,Thành phố Lai Châu,30202014,Phường Đoàn Kết
14,Tỉnh Lai Châu,30203,Huyện Phong Thổ,30203015,Xã Sin Suối Hồ
14,Tỉnh Lai Châu,30203,Huyện Phong Thổ,30203016,Xã Phong Thổ
14,Tỉnh Lai Châu,30203,Huyện Phong Thổ,30203017,Xã Sì Lở Lầu
14,Tỉnh Lai Châu,30203,Huyện Phong Thổ,30203018,Xã Dào San
14,Tỉnh Lai Châu,30203,Huyện Phong Thổ,30203019,Xã Khổng Lào
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207020,Xã Tủa Sín Chải
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207021,Xã Sìn Hồ
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207022,Xã Hồng Thu
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207023,Xã Nậm Tăm
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207024,Xã Pu Sam Cáp
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207025,Xã Nậm Cuổi
14,Tỉnh Lai Châu,30207,Huyện Sìn Hồ,30207026,Xã Nậm Mạ
14,Tỉnh Lai Châu,30213,Huyện Nậm Nhùn,30213027,Xã Lê Lợi
14,Tỉnh Lai Châu,30213,Huyện Nậm Nhùn,30213028,Xã Nậm Hàng
14,Tỉnh Lai Châu,30213,Huyện Nậm Nhùn,30213029,Xã Mường Mô
14,Tỉnh Lai Châu,30213,Huyện Nậm Nhùn,30213030,Xã Hua Bum
14,Tỉnh Lai Châu,30213,Huyện Nậm Nhùn,30213031,Xã Pa Tần
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201032,Xã Bum Nưa
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201033,Xã Bum Tở
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201034,Xã Mường Tè
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201035,Xã Thu Lũm
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201036,Xã Pa Ủ
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201037,Xã Tà Tổng
14,Tỉnh Lai Châu,30201,Huyện Mường Tè,30201038,Xã Mù Cả
15,Tỉnh Sơn La,30301,Thành phố Sơn La,30301001,Phường Tô Hiệu
15,Tỉnh Sơn La,30301,Thành phố Sơn La,30301002,Phường Chiềng An
15,Tỉnh Sơn La,30301,Thành phố Sơn La,30301003,Phường Chiềng Cơi
15,Tỉnh Sơn La,30301,Thành phố Sơn La,30301004,Phường Chiềng Sinh
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319005,Phường Mộc Châu
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319006,Phường Mộc Sơn
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319007,Phường Vân Sơn
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319008,Phường Thảo Nguyên
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319009,Xã Đoàn Kết
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319010,Xã Lóng Sập
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319011,Xã Chiềng Sơn
15,Tỉnh Sơn La,30323,Huyện Vân Hồ,30323012,Xã Vân Hồ
15,Tỉnh Sơn La,30323,Huyện Vân Hồ,30323013,Xã Song Khủa
15,Tỉnh Sơn La,30323,Huyện Vân Hồ,30323014,Xã Tô Múa
15,Tỉnh Sơn La,30323,Huyện Vân Hồ,30323015,Xã Xuân Nha
15,Tỉnh Sơn La,30303,Huyện Quỳnh Nhai,30303016,Xã Quỳnh Nhai
15,Tỉnh Sơn La,30303,Huyện Quỳnh Nhai,30303017,Xã Mường Chiên
15,Tỉnh Sơn La,30303,Huyện Quỳnh Nhai,30303018,Xã Mường Giôn
15,Tỉnh Sơn La,30303,Huyện Quỳnh Nhai,30303019,Xã Mường Sại
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307020,Xã Thuận Châu
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307021,Xã Chiềng La
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307022,Xã Nậm Lầu
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307023,Xã Muổi Nọi
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307024,Xã Mường Khiêng
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307025,Xã Co Mạ
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307026,Xã Bình Thuận
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307027,Xã Mường É
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307028,Xã Long Hẹ
15,Tỉnh Sơn La,30305,Huyện Mường La,30305029,Xã Mường La
15,Tỉnh Sơn La,30305,Huyện Mường La,30305030,Xã Chiềng Lao
15,Tỉnh Sơn La,30305,Huyện Mường La,30305031,Xã Mường Bú
15,Tỉnh Sơn La,30305,Huyện Mường La,30305032,Xã Chiềng Hoa
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309033,Xã Bắc Yên
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309034,Xã Tà Xùa
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309035,Xã Tạ Khoa
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309036,Xã Xím Vàng
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309037,Xã Pắc Ngà
15,Tỉnh Sơn La,30309,Huyện Bắc Yên,30309038,Xã Chiềng Sại
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311039,Xã Phù Yên
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311040,Xã Gia Phù
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311041,Xã Tường Hạ
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311042,Xã Mường Cơi
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311043,Xã Mường Bang
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311044,Xã Tân Phong
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311045,Xã Kim Bon
15,Tỉnh Sơn La,30317,Huyện Yên Châu,30317046,Xã Yên Châu
15,Tỉnh Sơn La,30317,Huyện Yên Châu,30317047,Xã Chiềng Hặc
15,Tỉnh Sơn La,30317,Huyện Yên Châu,30317048,Xã Lóng Phiêng
15,Tỉnh Sơn La,30317,Huyện Yên Châu,30317049,Xã Yên Sơn
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313050,Xã Chiềng Mai
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313051,Xã Mai Sơn
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313052,Xã Phiêng Pằn
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313053,Xã Chiềng Mung
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313054,Xã Phiêng Cằm
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313055,Xã Mường Chanh
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313056,Xã Tà Hộc
15,Tỉnh Sơn La,30313,Huyện Mai Sơn,30313057,Xã Chiềng Sung
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315058,Xã Bó Sinh
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315059,Xã Chiềng Khương
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315060,Xã Mường Hung
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315061,Xã Chiềng Khoong
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315062,Xã Mường Lầm
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315063,Xã Nậm Ty
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315064,Xã Sông Mã
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315065,Xã Huổi Một
15,Tỉnh Sơn La,30315,Huyện Sông Mã,30315066,Xã Chiềng Sơ
15,Tỉnh Sơn La,30321,Huyện Sốp Cộp,30321067,Xã Sốp Cộp
15,Tỉnh Sơn La,30321,Huyện Sốp Cộp,30321068,Xã Púng Bánh
15,Tỉnh Sơn La,30319,Thị xã Mộc Châu,30319069,Xã Tân Yên
15,Tỉnh Sơn La,30307,Huyện Thuận Châu,30307070,Xã Mường Bám
15,Tỉnh Sơn La,30305,Huyện Mường La,30305071,Xã Ngọc Chiến
15,Tỉnh Sơn La,30311,Huyện Phù Yên,30311072,Xã Suối Tọ
15,Tỉnh Sơn La,30317,Huyện Yên Châu,30317073,Xã Phiêng Khoài
15,Tỉnh Sơn La,30321,Huyện Sốp Cộp,30321074,Xã Mường Lạn
15,Tỉnh Sơn La,30321,Huyện Sốp Cộp,30321075,Xã Mường Lèo
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101001,Phường Hạc Thành
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101002,Phường Quảng Phú
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101003,Phường Đông Quang
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101004,Phường Đông Sơn
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101005,Phường Đông Tiến
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101006,Phường Hàm Rồng
16,Tỉnh Thanh Hóa,40101,Thành phố Thanh Hoá,40101007,Phường Nguyệt Viên
16,Tỉnh Thanh Hóa,40105,Thành Phố Sầm Sơn,40105008,Phường Sầm Sơn
16,Tỉnh Thanh Hóa,40105,Thành Phố Sầm Sơn,40105009,Phường Nam Sầm Sơn
16,Tỉnh Thanh Hóa,40103,Thị xã Bỉm Sơn,40103010,Phường Bỉm Sơn
16,Tỉnh Thanh Hóa,40103,Thị xã Bỉm Sơn,40103011,Phường Quang Trung
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153012,Phường Ngọc Sơn
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153013,Phường Tân Dân
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153014,Phường Hải Lĩnh
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153015,Phường Tĩnh Gia
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153016,Phường Đào Duy Tư
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153017,Phường Hải Bình
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153018,Phường Trúc Lâm
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153019,Phường Nghi Sơn
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153020,Xã Các Sơn
16,Tỉnh Thanh Hóa,40153,Thị xã Nghi Sơn,40153021,Xã Trường Lâm
16,Tỉnh Thanh Hóa,40131,Huyện Hà Trung,40131022,Xã Hà Trung
16,Tỉnh Thanh Hóa,40131,Huyện Hà Trung,40131023,Xã Tống Sơn
16,Tỉnh Thanh Hóa,40131,Huyện Hà Trung,40131024,Xã Hà Long
16,Tỉnh Thanh Hóa,40131,Huyện Hà Trung,40131025,Xã Hoạt Giang
16,Tỉnh Thanh Hóa,40131,Huyện Hà Trung,40131026,Xã Lĩnh Toại
16,Tỉnh Thanh Hóa,40139,Huyện Hậu Lộc,40139027,Xã Triệu Lộc
16,Tỉnh Thanh Hóa,40139,Huyện Hậu Lộc,40139028,Xã Đông Thành
16,Tỉnh Thanh Hóa,40139,Huyện Hậu Lộc,40139029,Xã Hậu Lộc
16,Tỉnh Thanh Hóa,40139,Huyện Hậu Lộc,40139030,Xã Hoa Lộc
16,Tỉnh Thanh Hóa,40139,Huyện Hậu Lộc,40139031,Xã Vạn Lộc
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133032,Xã Nga Sơn
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133033,Xã Nga Thắng
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133034,Xã Hồ Vương
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133035,Xã Tân Tiến
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133036,Xã Nga An
16,Tỉnh Thanh Hóa,40133,Huyện Nga Sơn,40133037,Xã Ba Đình
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143038,Xã Hoằng Hóa
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143039,Xã Hoằng Tiến
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143040,Xã Hoằng Thanh
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143041,Xã Hoằng Lộc
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143042,Xã Hoằng Châu
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143043,Xã Hoằng Sơn
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143044,Xã Hoằng Phú
16,Tỉnh Thanh Hóa,40143,Huyện Hoằng Hoá,40143045,Xã Hoằng Giang
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149046,Xã Lưu Vệ
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149047,Xã Quảng Yên
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149048,Xã Quảng Ngọc
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149049,Xã Quảng Ninh
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149050,Xã Quảng Bình
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149051,Xã Tiên Trang
16,Tỉnh Thanh Hóa,40149,Huyện Quảng Xương,40149052,Xã Quảng Chính
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151053,Xã Nông Cống
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151054,Xã Thắng Lợi
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151055,Xã Trung Chính
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151056,Xã Trường Văn
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151057,Xã Thăng Bình
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151058,Xã Tượng Lĩnh
16,Tỉnh Thanh Hóa,40151,Huyện Nông Cống,40151059,Xã Công Chính
16,Tỉnh Thanh Hóa,40141,Huyện Thiệu Hoá,40141060,Xã Thiệu Hóa
16,Tỉnh Thanh Hóa,40141,Huyện Thiệu Hoá,40141061,Xã Thiệu Quang
16,Tỉnh Thanh Hóa,40141,Huyện Thiệu Hoá,40141062,Xã Thiệu Tiến
16,Tỉnh Thanh Hóa,40141,Huyện Thiệu Hoá,40141063,Xã Thiệu Toán
16,Tỉnh Thanh Hóa,40141,Huyện Thiệu Hoá,40141064,Xã Thiệu Trung
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135065,Xã Yên Định
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135066,Xã Yên Trường
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135067,Xã Yên Phú
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135068,Xã Quý Lộc
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135069,Xã Yên Ninh
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135070,Xã Định Tân
16,Tỉnh Thanh Hóa,40135,Huyện Yên Định,40135071,Xã Định Hoà
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137072,Xã Thọ Xuân
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137073,Xã Thọ Long
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137074,Xã Xuân Hoà
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137075,Xã Sao Vàng
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137076,Xã Lam Sơn
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137077,Xã Thọ Lập
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137078,Xã Xuân Tín
16,Tỉnh Thanh Hóa,40137,Huyện Thọ Xuân,40137079,Xã Xuân Lập
16,Tỉnh Thanh Hóa,40129,Huyện Vĩnh Lộc,40129080,Xã Vĩnh Lộc
16,Tỉnh Thanh Hóa,40129,Huyện Vĩnh Lộc,40129081,Xã Tây Đô
16,Tỉnh Thanh Hóa,40129,Huyện Vĩnh Lộc,40129082,Xã Biện Thượng
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147083,Xã Triệu Sơn
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147084,Xã Thọ Bình
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147085,Xã Thọ Ngọc
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147086,Xã Thọ Phú
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147087,Xã Hợp Tiến
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147088,Xã An Nông
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147089,Xã Tân Ninh
16,Tỉnh Thanh Hóa,40147,Huyện Triệu Sơn,40147090,Xã Đồng Tiến
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107091,Xã Mường Chanh
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107092,Xã Quang Chiểu
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107093,Xã Tam chung
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107094,Xã Mường Lát
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107095,Xã Pù Nhi
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107096,Xã Nhi Sơn
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107097,Xã Mường Lý
16,Tỉnh Thanh Hóa,40107,Huyện Mường Lát,40107098,Xã Trung Lý
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109099,Xã Hồi Xuân
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109100,Xã Nam Xuân
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109101,Xã Thiên Phủ
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109102,Xã Hiền Kiệt
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109103,Xã Phú Xuân
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109104,Xã Phú Lệ
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109105,Xã Trung Thành
16,Tỉnh Thanh Hóa,40109,Huyện Quan Hoá,40109106,Xã Trung Sơn
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111107,Xã Na Mèo
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111108,Xã Sơn Thủy
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111109,Xã Sơn Điện
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111110,Xã Mường Mìn
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111111,Xã Tam Thanh
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111112,Xã Tam Lư
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111113,Xã Quan Sơn
16,Tỉnh Thanh Hóa,40111,Huyện Quan Sơn,40111114,Xã Trung Hạ
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117115,Xã Linh Sơn
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117116,Xã Đồng Lương
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117117,Xã Văn Phú
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117118,Xã Giao An
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117119,Xã Yên Khương
16,Tỉnh Thanh Hóa,40117,Huyện Lang Chánh,40117120,Xã Yên Thắng
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113121,Xã Văn Nho
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113122,Xã Thiết Ống
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113123,Xã Bá Thước
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113124,Xã Cổ Lũng
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113125,Xã Pù Luông
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113126,Xã Điền Lư
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113127,Xã Điền Quang
16,Tỉnh Thanh Hóa,40113,Huyện Bá Thước,40113128,Xã Quý Lương
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121129,Xã Ngọc Lặc
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121130,Xã Thạch Lập
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121131,Xã Ngọc Liên
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121132,Xã Minh Sơn
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121133,Xã Nguyệt Ấn
16,Tỉnh Thanh Hóa,40121,Huyện Ngọc Lặc,40121134,Xã Kiên Thọ
16,Tỉnh Thanh Hóa,40115,Huyện Cẩm Thuỷ,40115135,Xã Cẩm Thạch
16,Tỉnh Thanh Hóa,40115,Huyện Cẩm Thuỷ,40115136,Xã Cẩm Thủy
16,Tỉnh Thanh Hóa,40115,Huyện Cẩm Thuỷ,40115137,Xã Cẩm Tú
16,Tỉnh Thanh Hóa,40115,Huyện Cẩm Thuỷ,40115138,Xã Cẩm Vân
16,Tỉnh Thanh Hóa,40115,Huyện Cẩm Thuỷ,40115139,Xã Cẩm Tân
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119140,Xã Kim Tân
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119141,Xã Vân Du
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119142,Xã Ngọc Trạo
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119143,Xã Thạch Bình
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119144,Xã Thành Vinh
16,Tỉnh Thanh Hóa,40119,Huyện Thạch Thành,40119145,Xã Thạch Quảng
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125146,Xã Như Xuân
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125147,Xã Thượng Ninh
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125148,Xã Xuân Bình
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125149,Xã Hóa Quỳ
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125150,Xã Thanh Quân
16,Tỉnh Thanh Hóa,40125,Huyện Như Xuân,40125151,Xã Thanh Phong
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127152,Xã Xuân Du
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127153,Xã Mậu Lâm
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127154,Xã Như Thanh
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127155,Xã Yên Thọ
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127156,Xã Xuân Thái
16,Tỉnh Thanh Hóa,40127,Huyện Như Thanh,40127157,Xã Thanh Kỳ
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123158,Xã Bát Mọt
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123159,Xã Yên Nhân
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123160,Xã Lương Sơn
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123161,Xã Thường Xuân
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123162,Xã Luận Thành
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123163,Xã Tân Thành
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123164,Xã Vạn Xuân
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123165,Xã Thắng Lộc
16,Tỉnh Thanh Hóa,40123,Huyện Thường Xuân,40123166,Xã Xuân Chinh
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327001,Xã Anh Sơn
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327002,Xã Yên Xuân
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327003,Xã Nhân Hoà
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327004,Xã Anh Sơn Đông
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327005,Xã Vĩnh Tường
17,Tỉnh Nghệ An,40327,Huyện Anh Sơn,40327006,Xã Thành Bình Thọ
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321007,Xã Con Cuông
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321008,Xã Môn Sơn
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321009,Xã Mậu Thạch
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321010,Xã Cam Phục
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321011,Xã Châu Khê
17,Tỉnh Nghệ An,40321,Huyện Con Cuông,40321012,Xã Bình Chuẩn
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325013,Xã Diễn Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325014,Xã Đức Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325015,Xã Quảng Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325016,Xã Hải Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325017,Xã Tân Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325018,Xã An Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325019,Xã Minh Châu
17,Tỉnh Nghệ An,40325,Huyện Diễn Châu,40325020,Xã Hùng Châu
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329021,Xã Đô Lương
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329022,Xã Bạch Ngọc
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329023,Xã Văn Hiến
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329024,Xã Bạch Hà
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329025,Xã Thuần Trung
17,Tỉnh Nghệ An,40329,Huyện Đô Lương,40329026,Xã Lương Sơn
17,Tỉnh Nghệ An,40339,Thị xã Hoàng Mai,40339027,Phường Hoàng Mai
17,Tỉnh Nghệ An,40339,Thị xã Hoàng Mai,40339028,Phường Tân Mai
17,Tỉnh Nghệ An,40339,Thị xã Hoàng Mai,40339029,Phường Quỳnh Mai
17,Tỉnh Nghệ An,40337,Huyện Hưng Nguyên,40337030,Xã Hưng Nguyên
17,Tỉnh Nghệ An,40337,Huyện Hưng Nguyên,40337031,Xã Yên Trung
17,Tỉnh Nghệ An,40337,Huyện Hưng Nguyên,40337032,Xã Hưng Nguyên Nam
17,Tỉnh Nghệ An,40337,Huyện Hưng Nguyên,40337033,Xã Lam Thành
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309034,Xã Mường Xén
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309035,Xã Hữu Kiệm
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309036,Xã Nậm Cắn
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309037,Xã Chiêu Lưu
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309038,Xã Na Loi
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309039,Xã Mường Típ
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309040,Xã Na Ngoi
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309041,Xã Mỹ Lý
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309042,Xã Bắc Lý
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309043,Xã Keng Đu
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309044,Xã Huồi Tụ
17,Tỉnh Nghệ An,40309,Huyện Kỳ Sơn,40309045,Xã Mường Lống
17,Tỉnh Nghệ An,40335,Huyện Nam Đàn,40335046,Xã Vạn An
17,Tỉnh Nghệ An,40335,Huyện Nam Đàn,40335047,Xã Nam Đàn
17,Tỉnh Nghệ An,40335,Huyện Nam Đàn,40335048,Xã Đại Huệ
17,Tỉnh Nghệ An,40335,Huyện Nam Đàn,40335049,Xã Thiên Nhẫn
17,Tỉnh Nghệ An,40335,Huyện Nam Đàn,40335050,Xã Kim Liên
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313051,Xã Nghĩa Đàn
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313052,Xã Nghĩa Thọ
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313053,Xã Nghĩa Lâm
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313054,Xã Nghĩa Mai
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313055,Xã Nghĩa Hưng
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313056,Xã Nghĩa Khánh
17,Tỉnh Nghệ An,40313,Huyện Nghĩa Đàn,40313057,Xã Nghĩa Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333058,Xã Nghi Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333059,Xã Phúc Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333060,Xã Đông Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333061,Xã Trung Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333062,Xã Thần Lĩnh
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333063,Xã Hải Lộc
17,Tỉnh Nghệ An,40333,Huyện Nghi Lộc,40333064,Xã Văn Kiều
17,Tỉnh Nghệ An,40305,Huyện Quế Phong,40305065,Xã Quế Phong
17,Tỉnh Nghệ An,40305,Huyện Quế Phong,40305066,Xã Tiền Phong
17,Tỉnh Nghệ An,40305,Huyện Quế Phong,40305067,Xã Tri Lễ
17,Tỉnh Nghệ An,40305,Huyện Quế Phong,40305068,Xã Mường Quàng
17,Tỉnh Nghệ An,40305,Huyện Quế Phong,40305069,Xã Thông Thụ
17,Tỉnh Nghệ An,40307,Huyện Quỳ Châu,40307070,Xã Quỳ Châu
17,Tỉnh Nghệ An,40307,Huyện Quỳ Châu,40307071,Xã Châu Tiến
17,Tỉnh Nghệ An,40307,Huyện Quỳ Châu,40307072,Xã Hùng Chân
17,Tỉnh Nghệ An,40307,Huyện Quỳ Châu,40307073,Xã Châu Bình
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311074,Xã Quỳ Hợp
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311075,Xã Tam Hợp
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311076,Xã Châu Lộc
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311077,Xã Châu Hồng
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311078,Xã Mường Ham
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311079,Xã Mường Chọng
17,Tỉnh Nghệ An,40311,Huyện Quỳ Hợp,40311080,Xã Minh Hợp
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317081,Xã Quỳnh Lưu
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317082,Xã Quỳnh Văn
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317083,Xã Quỳnh Anh
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317084,Xã Quỳnh Tam
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317085,Xã Quỳnh Phú
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317086,Xã Quỳnh Sơn
17,Tỉnh Nghệ An,40317,Huyện Quỳnh Lưu,40317087,Xã Quỳnh Thắng
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319088,Xã Tân Kỳ
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319089,Xã Tân Phú
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319090,Xã Tân An
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319091,Xã Nghĩa Đồng
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319092,Xã Giai Xuân
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319093,Xã Nghĩa Hành
17,Tỉnh Nghệ An,40319,Huyện Tân Kỳ,40319094,Xã Tiên Đồng
17,Tỉnh Nghệ An,40314,Thị xã Thái Hoà,40314095,Phường Thái Hoà
17,Tỉnh Nghệ An,40314,Thị xã Thái Hoà,40314096,Phường Tây Hiếu
17,Tỉnh Nghệ An,40314,Thị xã Thái Hoà,40314097,Xã Đông Hiếu
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331098,Xã Cát Ngạn
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331099,Xã Tam Đồng
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331100,Xã Hạnh Lâm
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331101,Xã Sơn Lâm
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331102,Xã Hoa Quân
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331103,Xã Kim Bảng
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331104,Xã Bích Hào
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331105,Xã Đại Đồng
17,Tỉnh Nghệ An,40331,Huyện Thanh Chương,40331106,Xã Xuân Lâm
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315107,Xã Tam Quang
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315108,Xã Tam Thái
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315109,Xã Tương Dương
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315110,Xã Lượng Minh
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315111,Xã Yên Na
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315112,Xã Yên Hoà
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315113,Xã Nga My
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315114,Xã Hữu Khuông
17,Tỉnh Nghệ An,40315,Huyện Tương Dương,40315115,Xã Nhôn Mai
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301116,Phường Trường Vinh
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301117,Phường Thành Vinh
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301118,Phường Vinh Hưng
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301119,Phường Vinh Phú
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301120,Phường Vinh Lộc
17,Tỉnh Nghệ An,40301,Thành phố Vinh,40301121,Phường Cửa Lò
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323122,Xã Yên Thành
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323123,Xã Quan Thành
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323124,Xã Hợp Minh
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323125,Xã Vân Tụ
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323126,Xã Vân Du
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323127,Xã Quang Đồng
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323128,Xã Giai Lạc
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323129,Xã Bình Minh
17,Tỉnh Nghệ An,40323,Huyện Yên Thành,40323130,Xã Đông Thành
18,Tỉnh Hà Tĩnh,40520,Thị xã Kỳ Anh,40520001,Phường Sông Trí
18,Tỉnh Hà Tĩnh,40520,Thị xã Kỳ Anh,40520002,Phường Hải Ninh
18,Tỉnh Hà Tĩnh,40520,Thị xã Kỳ Anh,40520003,Phường Hoành Sơn
18,Tỉnh Hà Tĩnh,40520,Thị xã Kỳ Anh,40520004,Phường Vũng Áng
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519005,Xã Kỳ Xuân
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519006,Xã Kỳ Anh
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519007,Xã Kỳ Hoa
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519008,Xã Kỳ Văn
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519009,Xã Kỳ Khang
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519010,Xã Kỳ Lạc
18,Tỉnh Hà Tĩnh,40519,Huyện Kỳ Anh,40519011,Xã Kỳ Thượng
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515012,Xã Cẩm Xuyên
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515013,Xã Thiên Cầm
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515014,Xã Cẩm Duệ
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515015,Xã Cẩm Hưng
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515016,Xã Cẩm Lạc
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515017,Xã Cẩm Trung
18,Tỉnh Hà Tĩnh,40515,Huyện Cẩm Xuyên,40515018,Xã Yên Hoà
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501019,Phường Thành Sen
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501020,Phường Trần Phú
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501021,Phường Hà Huy Tập
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501022,Xã Thạch Lạc
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501023,Xã Đồng Tiến
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501024,Xã Thạch Khê
18,Tỉnh Hà Tĩnh,40501,Thành phố Hà Tĩnh,40501025,Xã Cẩm Bình
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513026,Xã Thạch Hà
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513027,Xã Toàn Lưu
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513028,Xã Việt Xuyên
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513029,Xã Đông Kinh
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513030,Xã Thạch Xuân
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513031,Xã Lộc Hà
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513032,Xã Hồng Lộc
18,Tỉnh Hà Tĩnh,40513,Huyện Thạch Hà,40513033,Xã Mai Phụ
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511034,Xã Can Lộc
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511035,Xã Tùng Lộc
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511036,Xã Gia Hanh
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511037,Xã Trường Lưu
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511038,Xã Xuân Lộc
18,Tỉnh Hà Tĩnh,40511,Huyện Can Lộc,40511039,Xã Đồng Lộc
18,Tỉnh Hà Tĩnh,40503,Thị xã Hồng Lĩnh,40503040,Phường Bắc Hồng Lĩnh
18,Tỉnh Hà Tĩnh,40503,Thị xã Hồng Lĩnh,40503041,Phường Nam Hồng Lĩnh
18,Tỉnh Hà Tĩnh,40505,Huyện Nghi Xuân,40505042,Xã Tiên Điền
18,Tỉnh Hà Tĩnh,40505,Huyện Nghi Xuân,40505043,Xã Nghi Xuân
18,Tỉnh Hà Tĩnh,40505,Huyện Nghi Xuân,40505044,Xã Cổ Đạm
18,Tỉnh Hà Tĩnh,40505,Huyện Nghi Xuân,40505045,Xã Đan Hải
18,Tỉnh Hà Tĩnh,40507,Huyện Đức Thọ,40507046,Xã Đức Thọ
18,Tỉnh Hà Tĩnh,40507,Huyện Đức Thọ,40507047,Xã Đức Quang
18,Tỉnh Hà Tĩnh,40507,Huyện Đức Thọ,40507048,Xã Đức Đồng
18,Tỉnh Hà Tĩnh,40507,Huyện Đức Thọ,40507049,Xã Đức Thịnh
18,Tỉnh Hà Tĩnh,40507,Huyện Đức Thọ,40507050,Xã Đức Minh
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509051,Xã Hương Sơn
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509052,Xã Sơn Tây
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509053,Xã Tứ Mỹ
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509054,Xã Sơn Giang
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509055,Xã Sơn Tiến
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509056,Xã Sơn Hồng
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509057,Xã Kim Hoa
18,Tỉnh Hà Tĩnh,40521,Huyện Vũ Quang,40521058,Xã Vũ Quang
18,Tỉnh Hà Tĩnh,40521,Huyện Vũ Quang,40521059,Xã Mai Hoa
18,Tỉnh Hà Tĩnh,40521,Huyện Vũ Quang,40521060,Xã Thượng Đức
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517061,Xã Hương Khê
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517062,Xã Hương Phố
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517063,Xã Hương Đô
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517064,Xã Hà Linh
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517065,Xã Hương Bình
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517066,Xã Phúc Trạch
18,Tỉnh Hà Tĩnh,40517,Huyện Hương Khê,40517067,Xã Hương Xuân
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509068,Xã Sơn Kim 1
18,Tỉnh Hà Tĩnh,40509,Huyện Hương Sơn,40509069,Xã Sơn Kim 2
19,Tỉnh Quảng Trị,40701,Thành phố Đồng Hới,40701001,Phường Đồng Hới
19,Tỉnh Quảng Trị,40701,Thành phố Đồng Hới,40701002,Phường Đồng Thuận
19,Tỉnh Quảng Trị,40701,Thành phố Đồng Hới,40701003,Phường Đồng Sơn
19,Tỉnh Quảng Trị,40715,Thị xã Ba Đồn,40715004,Xã Nam Gianh
19,Tỉnh Quảng Trị,40715,Thị xã Ba Đồn,40715005,Xã Nam Ba Đồn
19,Tỉnh Quảng Trị,40715,Thị xã Ba Đồn,40715006,Phường Ba Đồn
19,Tỉnh Quảng Trị,40715,Thị xã Ba Đồn,40715007,Phường Bắc Gianh
19,Tỉnh Quảng Trị,40705,Huyện Minh Hoá,40705008,Xã Dân Hóa
19,Tỉnh Quảng Trị,40705,Huyện Minh Hoá,40705009,Xã Kim Điền
19,Tỉnh Quảng Trị,40705,Huyện Minh Hoá,40705010,Xã Kim Phú
19,Tỉnh Quảng Trị,40705,Huyện Minh Hoá,40705011,Xã Minh Hóa
19,Tỉnh Quảng Trị,40705,Huyện Minh Hoá,40705012,Xã Tân Thành
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703013,Xã Tuyên Lâm
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703014,Xã Tuyên Sơn
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703015,Xã Đồng Lê
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703016,Xã Tuyên Phú
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703017,Xã Tuyên Bình
19,Tỉnh Quảng Trị,40703,Huyện Tuyên Hoá,40703018,Xã Tuyên Hóa
19,Tỉnh Quảng Trị,40707,Huyện Quảng Trạch,40707019,Xã Tân Gianh
19,Tỉnh Quảng Trị,40707,Huyện Quảng Trạch,40707020,Xã Trung Thuần
19,Tỉnh Quảng Trị,40707,Huyện Quảng Trạch,40707021,Xã Quảng Trạch
19,Tỉnh Quảng Trị,40707,Huyện Quảng Trạch,40707022,Xã Hoà Trạch
19,Tỉnh Quảng Trị,40707,Huyện Quảng Trạch,40707023,Xã Phú Trạch
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709024,Xã Thượng Trạch
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709025,Xã Phong Nha
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709026,Xã Bắc Trạch
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709027,Xã Đông Trạch
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709028,Xã Hoàn Lão
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709029,Xã Bố Trạch
19,Tỉnh Quảng Trị,40709,Huyện Bố Trạch,40709030,Xã Nam Trạch
19,Tỉnh Quảng Trị,40711,Huyện Quảng Ninh,40711031,Xã Quảng Ninh
19,Tỉnh Quảng Trị,40711,Huyện Quảng Ninh,40711032,Xã Ninh Châu
19,Tỉnh Quảng Trị,40711,Huyện Quảng Ninh,40711033,Xã Trường Ninh
19,Tỉnh Quảng Trị,40711,Huyện Quảng Ninh,40711034,Xã Trường Sơn
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713035,Xã Lệ Thủy
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713036,Xã Cam Hồng
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713037,Xã Sen Ngư
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713038,Xã Tân Mỹ
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713039,Xã Trường Phú
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713040,Xã Lệ Ninh
19,Tỉnh Quảng Trị,40713,Huyện Lệ Thuỷ,40713041,Xã Kim Ngân
19,Tỉnh Quảng Trị,40901,Thành phố Đông Hà,40901042,Phường Đông Hà
19,Tỉnh Quảng Trị,40901,Thành phố Đông Hà,40901043,Phường Nam Đông Hà
19,Tỉnh Quảng Trị,40903,Thị xã Quảng Trị,40903044,Phường Quảng Trị
19,Tỉnh Quảng Trị,40905,Huyện Vĩnh Linh,40905045,Xã Vĩnh Linh
19,Tỉnh Quảng Trị,40905,Huyện Vĩnh Linh,40905046,Xã Cửa Tùng
19,Tỉnh Quảng Trị,40905,Huyện Vĩnh Linh,40905047,Xã Vĩnh Hoàng
19,Tỉnh Quảng Trị,40905,Huyện Vĩnh Linh,40905048,Xã Vĩnh Thủy
19,Tỉnh Quảng Trị,40905,Huyện Vĩnh Linh,40905049,Xã Bến Quan
19,Tỉnh Quảng Trị,40907,Huyện Gio Linh,40907050,Xã Cồn Tiên
19,Tỉnh Quảng Trị,40907,Huyện Gio Linh,40907051,Xã Cửa Việt
19,Tỉnh Quảng Trị,40907,Huyện Gio Linh,40907052,Xã Gio Linh
19,Tỉnh Quảng Trị,40907,Huyện Gio Linh,40907053,Xã Bến Hải
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915054,Xã Hướng Lập
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915055,Xã Hướng Phùng
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915056,Xã Khe Sanh
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915057,Xã Tân Lập
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915058,Xã Lao Bảo
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915059,Xã Lìa
19,Tỉnh Quảng Trị,40915,Huyện Hướng Hoá,40915060,Xã A Dơi
19,Tỉnh Quảng Trị,40917,Huyện Đa Krông,40917061,Xã La Lay
19,Tỉnh Quảng Trị,40917,Huyện Đa Krông,40917062,Xã Tà Rụt
19,Tỉnh Quảng Trị,40917,Huyện Đa Krông,40917063,Xã Đakrông
19,Tỉnh Quảng Trị,40917,Huyện Đa Krông,40917064,Xã Ba Lòng
19,Tỉnh Quảng Trị,40917,Huyện Đa Krông,40917065,Xã Hướng Hiệp
19,Tỉnh Quảng Trị,40909,Huyện Cam Lộ,40909066,Xã Cam Lộ
19,Tỉnh Quảng Trị,40909,Huyện Cam Lộ,40909067,Xã Hiếu Giang
19,Tỉnh Quảng Trị,40911,Huyện Triệu Phong,40911068,Xã Triệu Phong
19,Tỉnh Quảng Trị,40911,Huyện Triệu Phong,40911069,Xã Ái Tử
19,Tỉnh Quảng Trị,40911,Huyện Triệu Phong,40911070,Xã Triệu Bình
19,Tỉnh Quảng Trị,40911,Huyện Triệu Phong,40911071,Xã Triệu Cơ
19,Tỉnh Quảng Trị,40911,Huyện Triệu Phong,40911072,Xã Nam Cửa Việt
19,Tỉnh Quảng Trị,40913,Huyện Hải Lăng,40913073,Xã Diên Sanh
19,Tỉnh Quảng Trị,40913,Huyện Hải Lăng,40913074,Xã Mỹ Thủy
19,Tỉnh Quảng Trị,40913,Huyện Hải Lăng,40913075,Xã Hải Lăng
19,Tỉnh Quảng Trị,40913,Huyện Hải Lăng,40913076,Xã Vĩnh Định
19,Tỉnh Quảng Trị,40913,Huyện Hải Lăng,40913077,Xã Nam Hải Lăng
19,Tỉnh Quảng Trị,40919,Huyện Đảo Cồn Cỏ,40919078,Đặc khu Cồn Cỏ
20,Thành phố Huế,41109,Huyện Phú Vang,41109001,Phường Thuận An
20,Thành phố Huế,41119,Quận Phú Xuân,41119002,Phường Hóa Châu
20,Thành phố Huế,41109,Huyện Phú Vang,41109003,Phường Mỹ Thượng
20,Thành phố Huế,41101,Quận Thuận Hóa,41101004,Phường Vỹ Dạ
20,Thành phố Huế,41101,Quận Thuận Hóa,41101005,Phường Thuận Hóa
20,Thành phố Huế,41101,Quận Thuận Hóa,41101006,Phường An Cựu
20,Thành phố Huế,41101,Quận Thuận Hóa,41101007,Phường Thủy Xuân
20,Thành phố Huế,41119,Quận Phú Xuân,41119008,Phường Kim Long
20,Thành phố Huế,41119,Quận Phú Xuân,41119009,Phường Hương An
20,Thành phố Huế,41119,Quận Phú Xuân,41119010,Phường Phú Xuân
20,Thành phố Huế,41107,Thị xã Hương Trà,41107011,Phường Hương Trà
20,Thành phố Huế,41107,Thị xã Hương Trà,41107012,Phường Kim Trà
20,Thành phố Huế,41111,Thị xã Hương Thuỷ,41111013,Phường Thanh Thủy
20,Thành phố Huế,41111,Thị xã Hương Thuỷ,41111014,Phường Hương Thủy
20,Thành phố Huế,41111,Thị xã Hương Thuỷ,41111015,Phường Phú Bài
20,Thành phố Huế,41103,Thị xã Phong Điền,41103016,Phường Phong Điền
20,Thành phố Huế,41103,Thị xã Phong Điền,41103017,Phường Phong Thái
20,Thành phố Huế,41103,Thị xã Phong Điền,41103018,Phường Phong Dinh
20,Thành phố Huế,41103,Thị xã Phong Điền,41103019,Phường Phong Phú
20,Thành phố Huế,41105,Huyện Quảng Điền,41105020,Phường Phong Quảng
20,Thành phố Huế,41105,Huyện Quảng Điền,41105021,Xã Đan Điền
20,Thành phố Huế,41105,Huyện Quảng Điền,41105022,Xã Quảng Điền
20,Thành phố Huế,41109,Huyện Phú Vang,41109023,Xã Phú Vinh
20,Thành phố Huế,41109,Huyện Phú Vang,41109024,Xã Phú Hồ
20,Thành phố Huế,41109,Huyện Phú Vang,41109025,Xã Phú Vang
20,Thành phố Huế,41113,Huyện Phú Lộc,41113026,Xã Vinh Lộc
20,Thành phố Huế,41113,Huyện Phú Lộc,41113027,Xã Hưng Lộc
20,Thành phố Huế,41113,Huyện Phú Lộc,41113028,Xã Lộc An
20,Thành phố Huế,41113,Huyện Phú Lộc,41113029,Xã Phú Lộc
20,Thành phố Huế,41113,Huyện Phú Lộc,41113030,Xã Chân Mây – Lăng Cô
20,Thành phố Huế,41113,Huyện Phú Lộc,41113031,Xã Long Quảng
20,Thành phố Huế,41113,Huyện Phú Lộc,41113032,Xã Nam Đông
20,Thành phố Huế,41113,Huyện Phú Lộc,41113033,Xã Khe Tre
20,Thành phố Huế,41107,Thị xã Hương Trà,41107034,Xã Bình Điền
20,Thành phố Huế,41115,Huyện A Lưới,41115035,Xã A Lưới 1
20,Thành phố Huế,41115,Huyện A Lưới,41115036,Xã A Lưới 2
20,Thành phố Huế,41115,Huyện A Lưới,41115037,Xã A Lưới 3
20,Thành phố Huế,41115,Huyện A Lưới,41115038,Xã A Lưới 4
20,Thành phố Huế,41115,Huyện A Lưới,41115039,Xã A Lưới 5
20,Thành phố Huế,41101,Quận Thuận Hóa,41101040,Phường Dương Nỗ
21,Tp Đà Nẵng,50101,Quận Hải Châu,50101001,Phường Hải Châu
21,Tp Đà Nẵng,50101,Quận Hải Châu,50101002,Phường Hoà Cường
21,Tp Đà Nẵng,50103,Quận Thanh Khê,50103003,Phường Thanh Khê
21,Tp Đà Nẵng,50115,Quận Cẩm Lệ,50115004,Phường An Khê
21,Tp Đà Nẵng,50105,Quận Sơn Trà,50105005,Phường An Hải
21,Tp Đà Nẵng,50105,Quận Sơn Trà,50105006,Phường Sơn Trà
21,Tp Đà Nẵng,50107,Quận Ngũ Hành Sơn,50107007,Phường Ngũ Hành Sơn
21,Tp Đà Nẵng,50109,Quận Liên Chiểu,50109008,Phường Hoà Khánh
21,Tp Đà Nẵng,50109,Quận Liên Chiểu,50109009,Phường Hải Vân
21,Tp Đà Nẵng,50109,Quận Liên Chiểu,50109010,Phường Liên Chiểu
21,Tp Đà Nẵng,50115,Quận Cẩm Lệ,50115011,Phường Cẩm Lệ
21,Tp Đà Nẵng,50111,Huyện Hoà Vang,50111012,Phường Hoà Xuân
21,Tp Đà Nẵng,50111,Huyện Hoà Vang,50111013,Xã Hoà Vang
21,Tp Đà Nẵng,50111,Huyện Hoà Vang,50111014,Xã Hoà Tiến
21,Tp Đà Nẵng,50111,Huyện Hoà Vang,50111015,Xã Bà Nà
21,Tp Đà Nẵng,50113,Huyện đảo Hoàng Sa,50113016,Đặc khu Hoàng Sa
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325017,Xã Núi Thành
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325018,Xã Tam Mỹ
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325019,Xã Tam Anh
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325020,Xã Đức Phú
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325021,Xã Tam Xuân
21,Tp Đà Nẵng,50325,Huyện Núi Thành,50325022,Xã Tam Hải
21,Tp Đà Nẵng,50301,Thành phố Tam Kỳ,50301023,Phường Tam Kỳ
21,Tp Đà Nẵng,50301,Thành phố Tam Kỳ,50301024,Phường Quảng Phú
21,Tp Đà Nẵng,50301,Thành phố Tam Kỳ,50301025,Phường Hương Trà
21,Tp Đà Nẵng,50301,Thành phố Tam Kỳ,50301026,Phường Bàn Thạch
21,Tp Đà Nẵng,50302,Huyện Phú Ninh,50302027,Xã Tây Hồ
21,Tp Đà Nẵng,50302,Huyện Phú Ninh,50302028,Xã Chiên Đàn
21,Tp Đà Nẵng,50302,Huyện Phú Ninh,50302029,Xã Phú Ninh
21,Tp Đà Nẵng,50321,Huyện Tiên Phước,50321030,Xã Lãnh Ngọc
21,Tp Đà Nẵng,50321,Huyện Tiên Phước,50321031,Xã Tiên Phước
21,Tp Đà Nẵng,50321,Huyện Tiên Phước,50321032,Xã Thạnh Bình
21,Tp Đà Nẵng,50321,Huyện Tiên Phước,50321033,Xã Sơn Cẩm Hà
21,Tp Đà Nẵng,50327,Huyện Bắc Trà My,50327034,Xã Trà Liên
21,Tp Đà Nẵng,50327,Huyện Bắc Trà My,50327035,Xã Trà Giáp
21,Tp Đà Nẵng,50327,Huyện Bắc Trà My,50327036,Xã Trà Tân
21,Tp Đà Nẵng,50327,Huyện Bắc Trà My,50327037,Xã Trà Đốc
21,Tp Đà Nẵng,50327,Huyện Bắc Trà My,50327038,Xã Trà My
21,Tp Đà Nẵng,50329,Huyện Nam Trà My,50329039,Xã Nam Trà My
21,Tp Đà Nẵng,50329,Huyện Nam Trà My,50329040,Xã Trà Tập
21,Tp Đà Nẵng,50329,Huyện Nam Trà My,50329041,Xã Trà Vân
21,Tp Đà Nẵng,50329,Huyện Nam Trà My,50329042,Xã Trà Linh
21,Tp Đà Nẵng,50329,Huyện Nam Trà My,50329043,Xã Trà Leng
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315044,Xã Thăng Bình
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315045,Xã Thăng An
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315046,Xã Thăng Trường
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315047,Xã Thăng Điền
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315048,Xã Thăng Phú
21,Tp Đà Nẵng,50315,Huyện Thăng Bình,50315049,Xã Đồng Dương
21,Tp Đà Nẵng,50317,Huyện Quế Sơn,50317050,Xã Quế Sơn Trung
21,Tp Đà Nẵng,50317,Huyện Quế Sơn,50317051,Xã Quế Sơn
21,Tp Đà Nẵng,50317,Huyện Quế Sơn,50317052,Xã Xuân Phú
21,Tp Đà Nẵng,50317,Huyện Quế Sơn,50317053,Xã Nông Sơn
21,Tp Đà Nẵng,50317,Huyện Quế Sơn,50317054,Xã Quế Phước
21,Tp Đà Nẵng,50311,Huyện Duy Xuyên,50311055,Xã Duy Nghĩa
21,Tp Đà Nẵng,50311,Huyện Duy Xuyên,50311056,Xã Nam Phước
21,Tp Đà Nẵng,50311,Huyện Duy Xuyên,50311057,Xã Duy Xuyên
21,Tp Đà Nẵng,50311,Huyện Duy Xuyên,50311058,Xã Thu Bồn
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309059,Phường Điện Bàn
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309060,Phường Điện Bàn Đông
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309061,Phường An Thắng
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309062,Phường Điện Bàn Bắc
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309063,Xã Điện Bàn Tây
21,Tp Đà Nẵng,50309,Thị xã Điện Bàn,50309064,Xã Gò Nổi
21,Tp Đà Nẵng,50303,Thành phố Hội An,50303065,Phường Hội An
21,Tp Đà Nẵng,50303,Thành phố Hội An,50303066,Phường Hội An Đông
21,Tp Đà Nẵng,50303,Thành phố Hội An,50303067,Phường Hội An Tây
21,Tp Đà Nẵng,50303,Thành phố Hội An,50303068,Xã Tân Hiệp
21,Tp Đà Nẵng,50307,Huyện Đại Lộc,50307069,Xã Đại Lộc
21,Tp Đà Nẵng,50307,Huyện Đại Lộc,50307070,Xã Hà Nha
21,Tp Đà Nẵng,50307,Huyện Đại Lộc,50307071,Xã Thượng Đức
21,Tp Đà Nẵng,50307,Huyện Đại Lộc,50307072,Xã Vu Gia
21,Tp Đà Nẵng,50307,Huyện Đại Lộc,50307073,Xã Phú Thuận
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313074,Xã Thạnh Mỹ
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313075,Xã Bến Giằng
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313076,Xã Nam Giang
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313077,Xã Đắc Pring
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313078,Xã La Dêê
21,Tp Đà Nẵng,50313,Huyện Nam Giang,50313079,Xã La Êê
21,Tp Đà Nẵng,50305,Huyện Đông Giang,50305080,Xã Sông Vàng
21,Tp Đà Nẵng,50305,Huyện Đông Giang,50305081,Xã Sông Kôn
21,Tp Đà Nẵng,50305,Huyện Đông Giang,50305082,Xã Đông Giang
21,Tp Đà Nẵng,50305,Huyện Đông Giang,50305083,Xã Bến Hiên
21,Tp Đà Nẵng,50304,Huyện Tây Giang,50304084,Xã Avương
21,Tp Đà Nẵng,50304,Huyện Tây Giang,50304085,Xã Tây Giang
21,Tp Đà Nẵng,50304,Huyện Tây Giang,50304086,Xã Hùng Sơn
21,Tp Đà Nẵng,50319,Huyện Hiệp Đức,50319087,Xã Hiệp Đức
21,Tp Đà Nẵng,50319,Huyện Hiệp Đức,50319088,Xã Việt An
21,Tp Đà Nẵng,50319,Huyện Hiệp Đức,50319089,Xã Phước Trà
21,Tp Đà Nẵng,50323,Huyện Phước Sơn,50323090,Xã Khâm Đức
21,Tp Đà Nẵng,50323,Huyện Phước Sơn,50323091,Xã Phước Năng
21,Tp Đà Nẵng,50323,Huyện Phước Sơn,50323092,Xã Phước Chánh
21,Tp Đà Nẵng,50323,Huyện Phước Sơn,50323093,Xã Phước Thành
21,Tp Đà Nẵng,50323,Huyện Phước Sơn,50323094,Xã Phước Hiệp
22,Tỉnh Quảng Ngãi,50501,Thành phố Quảng Ngãi,50501001,Xã Tịnh Khê
22,Tỉnh Quảng Ngãi,50501,Thành phố Quảng Ngãi,50501002,Phường Trương Quang Trọng
22,Tỉnh Quảng Ngãi,50501,Thành phố Quảng Ngãi,50501003,Xã An Phú
22,Tỉnh Quảng Ngãi,50501,Thành phố Quảng Ngãi,50501004,Phường Cẩm Thành
22,Tỉnh Quảng Ngãi,50501,Thành phố Quảng Ngãi,50501005,Phường Nghĩa Lộ
22,Tỉnh Quảng Ngãi,50523,Thị xã Đức Phổ,50523006,Phường Trà Câu
22,Tỉnh Quảng Ngãi,50523,Thị xã Đức Phổ,50523007,Xã Nguyễn Nghiêm
22,Tỉnh Quảng Ngãi,50523,Thị xã Đức Phổ,50523008,Phường Đức Phổ
22,Tỉnh Quảng Ngãi,50523,Thị xã Đức Phổ,50523009,Xã Khánh Cường
22,Tỉnh Quảng Ngãi,50523,Thị xã Đức Phổ,50523010,Phường Sa Huỳnh
22,Tỉnh Quảng Ngãi,50505,Huyện Bình Sơn,50505011,Xã Bình Minh
22,Tỉnh Quảng Ngãi,50505,Huyện Bình Sơn,50505012,Xã Bình Chương
22,Tỉnh Quảng Ngãi,50505,Huyện Bình Sơn,50505013,Xã Bình Sơn
22,Tỉnh Quảng Ngãi,50505,Huyện Bình Sơn,50505014,Xã Vạn Tường
22,Tỉnh Quảng Ngãi,50505,Huyện Bình Sơn,50505015,Xã Đông Sơn
22,Tỉnh Quảng Ngãi,50509,Huyện Sơn Tịnh,50509016,Xã Trường Giang
22,Tỉnh Quảng Ngãi,50509,Huyện Sơn Tịnh,50509017,Xã Ba Gia
22,Tỉnh Quảng Ngãi,50509,Huyện Sơn Tịnh,50509018,Xã Sơn Tịnh
22,Tỉnh Quảng Ngãi,50509,Huyện Sơn Tịnh,50509019,Xã Thọ Phong
22,Tỉnh Quảng Ngãi,50515,Huyện Tư Nghĩa,50515020,Xã Tư Nghĩa
22,Tỉnh Quảng Ngãi,50515,Huyện Tư Nghĩa,50515021,Xã Vệ Giang
22,Tỉnh Quảng Ngãi,50515,Huyện Tư Nghĩa,50515022,Xã Nghĩa Giang
22,Tỉnh Quảng Ngãi,50515,Huyện Tư Nghĩa,50515023,Xã Trà Giang
22,Tỉnh Quảng Ngãi,50517,Huyện Nghĩa Hành,50517024,Xã Nghĩa Hành
22,Tỉnh Quảng Ngãi,50517,Huyện Nghĩa Hành,50517025,Xã Đình Cương
22,Tỉnh Quảng Ngãi,50517,Huyện Nghĩa Hành,50517026,Xã Thiện Tín
22,Tỉnh Quảng Ngãi,50517,Huyện Nghĩa Hành,50517027,Xã Phước Giang
22,Tỉnh Quảng Ngãi,50521,Huyện Mộ Đức,50521028,Xã Long Phụng
22,Tỉnh Quảng Ngãi,50521,Huyện Mộ Đức,50521029,Xã Mỏ Cày
22,Tỉnh Quảng Ngãi,50521,Huyện Mộ Đức,50521030,Xã Mộ Đức
22,Tỉnh Quảng Ngãi,50521,Huyện Mộ Đức,50521031,Xã Lân Phong
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507032,Xã Trà Bồng
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507033,Xã Đông Trà Bồng
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507034,Xã Tây Trà
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507035,Xã Thanh Bồng
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507036,Xã Cà Đam
22,Tỉnh Quảng Ngãi,50507,Huyện Trà Bồng,50507037,Xã Tây Trà Bồng
22,Tỉnh Quảng Ngãi,50513,Huyện Sơn Hà,50513038,Xã Sơn Hạ
22,Tỉnh Quảng Ngãi,50513,Huyện Sơn Hà,50513039,Xã Sơn Linh
22,Tỉnh Quảng Ngãi,50513,Huyện Sơn Hà,50513040,Xã Sơn Hà
22,Tỉnh Quảng Ngãi,50513,Huyện Sơn Hà,50513041,Xã Sơn Thủy
22,Tỉnh Quảng Ngãi,50513,Huyện Sơn Hà,50513042,Xã Sơn Kỳ
22,Tỉnh Quảng Ngãi,50511,Huyện Sơn Tây,50511043,Xã Sơn Tây
22,Tỉnh Quảng Ngãi,50511,Huyện Sơn Tây,50511044,Xã Sơn Tây Thượng
22,Tỉnh Quảng Ngãi,50511,Huyện Sơn Tây,50511045,Xã Sơn Tây Hạ
22,Tỉnh Quảng Ngãi,50519,Huyện Minh Long,50519046,Xã Minh Long
22,Tỉnh Quảng Ngãi,50519,Huyện Minh Long,50519047,Xã Sơn Mai
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525048,Xã Ba Vì
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525049,Xã Ba Tô
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525050,Xã Ba Dinh
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525051,Xã Ba Tơ
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525052,Xã Ba Vinh
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525053,Xã Ba Động
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525054,Xã Đặng Thùy Trâm
22,Tỉnh Quảng Ngãi,50525,Huyện Ba Tơ,50525055,Xã Ba Xa
22,Tỉnh Quảng Ngãi,50503,Huyện Lý Sơn,50503056,Đặc khu Lý Sơn
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101057,Phường Kon Tum
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101058,Phường Đăk Cấm
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101059,Phường Đăk BLa
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101060,Xã Ngọk Bay
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101061,Xã Ia Chim
22,Tỉnh Quảng Ngãi,60101,Thành phố Kon Tum,60101062,Xã Đăk Rơ Wa
22,Tỉnh Quảng Ngãi,60111,Huyện Đăk Hà,60111063,Xã Đăk Pxi
22,Tỉnh Quảng Ngãi,60111,Huyện Đăk Hà,60111064,Xã Đăk Mar
22,Tỉnh Quảng Ngãi,60111,Huyện Đăk Hà,60111065,Xã Đăk Ui
22,Tỉnh Quảng Ngãi,60111,Huyện Đăk Hà,60111066,Xã Ngọk Réo
22,Tỉnh Quảng Ngãi,60111,Huyện Đăk Hà,60111067,Xã Đăk Hà
22,Tỉnh Quảng Ngãi,60107,Huyện Đắk Tô,60107068,Xã Ngọk Tụ
22,Tỉnh Quảng Ngãi,60107,Huyện Đắk Tô,60107069,Xã Đăk Tô
22,Tỉnh Quảng Ngãi,60107,Huyện Đắk Tô,60107070,Xã Kon Đào
22,Tỉnh Quảng Ngãi,60115,Huyện Tu Mơ Rông,60115071,Xã Đăk Sao
22,Tỉnh Quảng Ngãi,60115,Huyện Tu Mơ Rông,60115072,Xã Đăk Tờ Kan
22,Tỉnh Quảng Ngãi,60115,Huyện Tu Mơ Rông,60115073,Xã Tu Mơ Rông
22,Tỉnh Quảng Ngãi,60115,Huyện Tu Mơ Rông,60115074,Xã Măng Ri
22,Tỉnh Quảng Ngãi,60105,Huyện Ngọc Hồi,60105075,Xã Bờ Y
22,Tỉnh Quảng Ngãi,60105,Huyện Ngọc Hồi,60105076,Xã Sa Loong
22,Tỉnh Quảng Ngãi,60105,Huyện Ngọc Hồi,60105077,Xã Dục Nông
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103078,Xã Xốp
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103079,Xã Ngọc Linh
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103080,Xã Đăk Plô
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103081,Xã Đăk Pék
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103082,Xã Đăk Môn
22,Tỉnh Quảng Ngãi,60113,Huyện Sa Thầy,60113083,Xã Sa Thầy
22,Tỉnh Quảng Ngãi,60113,Huyện Sa Thầy,60113084,Xã Sa Bình
22,Tỉnh Quảng Ngãi,60113,Huyện Sa Thầy,60113085,Xã Ya Ly
22,Tỉnh Quảng Ngãi,60114,Huyện Ia H'Drai,60114086,Xã Ia Tơi
22,Tỉnh Quảng Ngãi,60108,Huyện Kon Rẫy,60108087,Xã Đăk Kôi
22,Tỉnh Quảng Ngãi,60108,Huyện Kon Rẫy,60108088,Xã Kon Braih
22,Tỉnh Quảng Ngãi,60108,Huyện Kon Rẫy,60108089,Xã Đăk Rve
22,Tỉnh Quảng Ngãi,60109,Huyện Kon Plông,60109090,Xã Măng Đen
22,Tỉnh Quảng Ngãi,60109,Huyện Kon Plông,60109091,Xã Măng Bút
22,Tỉnh Quảng Ngãi,60109,Huyện Kon Plông,60109092,Xã Kon Plông
22,Tỉnh Quảng Ngãi,60103,Huyện Đắk Glei,60103093,Xã Đăk Long
22,Tỉnh Quảng Ngãi,60113,Huyện Sa Thầy,60113094,Xã Rờ Kơi
22,Tỉnh Quảng Ngãi,60113,Huyện Sa Thầy,60113095,Xã Mô Rai
22,Tỉnh Quảng Ngãi,60114,Huyện Ia H'Drai,60114096,Xã Ia Đal
23,Tỉnh Khánh Hòa,51101,Thành phố Nha Trang,51101001,Phường Nha Trang
23,Tỉnh Khánh Hòa,51101,Thành phố Nha Trang,51101002,Phường Bắc Nha Trang
23,Tỉnh Khánh Hòa,51101,Thành phố Nha Trang,51101003,Phường Tây Nha Trang
23,Tỉnh Khánh Hòa,51101,Thành phố Nha Trang,51101004,Phường Nam Nha Trang
23,Tỉnh Khánh Hòa,51109,Thành phố Cam Ranh,51109005,Phường Bắc Cam Ranh
23,Tỉnh Khánh Hòa,51109,Thành phố Cam Ranh,51109006,Phường Cam Ranh
23,Tỉnh Khánh Hòa,51109,Thành phố Cam Ranh,51109007,Phường Cam Linh
23,Tỉnh Khánh Hòa,51109,Thành phố Cam Ranh,51109008,Phường Ba Ngòi
23,Tỉnh Khánh Hòa,51109,Thành phố Cam Ranh,51109009,Xã Nam Cam Ranh
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105010,Xã Bắc Ninh Hoà
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105011,Phường Ninh Hoà
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105012,Xã Tân Định
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105013,Phường Đông Ninh Hoà
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105014,Phường Hoà Thắng
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105015,Xã Nam Ninh Hoà
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105016,Xã Tây Ninh Hoà
23,Tỉnh Khánh Hòa,51105,Thị xã Ninh Hoà,51105017,Xã Hoà Trí
23,Tỉnh Khánh Hòa,51103,Huyện Vạn Ninh,51103018,Xã Đại Lãnh
23,Tỉnh Khánh Hòa,51103,Huyện Vạn Ninh,51103019,Xã Tu Bông
23,Tỉnh Khánh Hòa,51103,Huyện Vạn Ninh,51103020,Xã Vạn Thắng
23,Tỉnh Khánh Hòa,51103,Huyện Vạn Ninh,51103021,Xã Vạn Ninh
23,Tỉnh Khánh Hòa,51103,Huyện Vạn Ninh,51103022,Xã Vạn Hưng
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107023,Xã Diên Khánh
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107024,Xã Diên Lạc
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107025,Xã Diên Điền
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107026,Xã Diên Lâm
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107027,Xã Diên Thọ
23,Tỉnh Khánh Hòa,51107,Huyện Diên Khánh,51107028,Xã Suối Hiệp
23,Tỉnh Khánh Hòa,51117,Huyện Cam Lâm,51117029,Xã Cam Lâm
23,Tỉnh Khánh Hòa,51117,Huyện Cam Lâm,51117030,Xã Suối Dầu
23,Tỉnh Khánh Hòa,51117,Huyện Cam Lâm,51117031,Xã Cam Hiệp
23,Tỉnh Khánh Hòa,51117,Huyện Cam Lâm,51117032,Xã Cam An
23,Tỉnh Khánh Hòa,51111,Huyện Khánh Vĩnh,51111033,Xã Bắc Khánh Vĩnh
23,Tỉnh Khánh Hòa,51111,Huyện Khánh Vĩnh,51111034,Xã Trung Khánh Vĩnh
23,Tỉnh Khánh Hòa,51111,Huyện Khánh Vĩnh,51111035,Xã Tây Khánh Vĩnh
23,Tỉnh Khánh Hòa,51111,Huyện Khánh Vĩnh,51111036,Xã Nam Khánh Vĩnh
23,Tỉnh Khánh Hòa,51111,Huyện Khánh Vĩnh,51111037,Xã Khánh Vĩnh
23,Tỉnh Khánh Hòa,51113,Huyện Khánh Sơn,51113038,Xã Khánh Sơn
23,Tỉnh Khánh Hòa,51113,Huyện Khánh Sơn,51113039,Xã Tây Khánh Sơn
23,Tỉnh Khánh Hòa,51113,Huyện Khánh Sơn,51113040,Xã Đông Khánh Sơn
23,Tỉnh Khánh Hòa,51115,Huyện Trường Sa,51115041,Đặc khu Trường Sa
23,Tỉnh Khánh Hòa,70501,TP.Phan Rang-Tháp Chàm,70501042,Phường Phan Rang
23,Tỉnh Khánh Hòa,70501,TP.Phan Rang-Tháp Chàm,70501043,Phường Đông Hải
23,Tỉnh Khánh Hòa,70505,Huyện Ninh Hải,70505044,Phường Ninh Chử
23,Tỉnh Khánh Hòa,70501,TP.Phan Rang-Tháp Chàm,70501045,Phường Bảo An
23,Tỉnh Khánh Hòa,70501,TP.Phan Rang-Tháp Chàm,70501046,Phường Đô Vinh
23,Tỉnh Khánh Hòa,70507,Huyện Ninh Phước,70507047,Xã Ninh Phước
23,Tỉnh Khánh Hòa,70507,Huyện Ninh Phước,70507048,Xã Phước Hữu
23,Tỉnh Khánh Hòa,70507,Huyện Ninh Phước,70507049,Xã Phước Hậu
23,Tỉnh Khánh Hòa,70513,Huyện Thuận Nam,70513050,Xã Thuận Nam
23,Tỉnh Khánh Hòa,70513,Huyện Thuận Nam,70513051,Xã Cà Ná
23,Tỉnh Khánh Hòa,70513,Huyện Thuận Nam,70513052,Xã Phước Hà
23,Tỉnh Khánh Hòa,70513,Huyện Thuận Nam,70513053,Xã Phước Dinh
23,Tỉnh Khánh Hòa,70505,Huyện Ninh Hải,70505054,Xã Ninh Hải
23,Tỉnh Khánh Hòa,70505,Huyện Ninh Hải,70505055,Xã Xuân Hải
23,Tỉnh Khánh Hòa,70505,Huyện Ninh Hải,70505056,Xã Vĩnh Hải
23,Tỉnh Khánh Hòa,70511,Huyện Thuận Bắc,70511057,Xã Thuận Bắc
23,Tỉnh Khánh Hòa,70511,Huyện Thuận Bắc,70511058,Xã Công Hải
23,Tỉnh Khánh Hòa,70503,Huyện Ninh Sơn,70503059,Xã Ninh Sơn
23,Tỉnh Khánh Hòa,70503,Huyện Ninh Sơn,70503060,Xã Lâm Sơn
23,Tỉnh Khánh Hòa,70503,Huyện Ninh Sơn,70503061,Xã Anh Dũng
23,Tỉnh Khánh Hòa,70503,Huyện Ninh Sơn,70503062,Xã Mỹ Sơn
23,Tỉnh Khánh Hòa,70509,Huyện Bác Ái,70509063,Xã Bác Ái Đông
23,Tỉnh Khánh Hòa,70509,Huyện Bác Ái,70509064,Xã Bác Ái
23,Tỉnh Khánh Hòa,70509,Huyện Bác Ái,70509065,Xã Bác Ái Tây
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701001,Phường Quy Nhơn
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701002,Phường Quy Nhơn Đông
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701003,Phường Quy Nhơn Tây
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701004,Phường Quy Nhơn Nam
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701005,Phường Quy Nhơn Bắc
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717006,Phường Bình Định
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717007,Phường An Nhơn
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717008,Phường An Nhơn Đông
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717009,Phường An Nhơn Nam
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717010,Phường An Nhơn Bắc
24,Tỉnh Gia Lai,50717,Thị xã An Nhơn,50717011,Xã An Nhơn Tây
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705012,Phường Bồng Sơn
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705013,Phường Hoài Nhơn
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705014,Phường Tam Quan
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705015,Phường Hoài Nhơn Đông
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705016,Phường Hoài Nhơn Tây
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705017,Phường Hoài Nhơn Nam
24,Tỉnh Gia Lai,50705,Thị xã Hoài Nhơn,50705018,Phường Hoài Nhơn Bắc
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713019,Xã Phù Cát
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713020,Xã Xuân An
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713021,Xã Ngô Mây
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713022,Xã Cát Tiến
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713023,Xã Đề Gi
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713024,Xã Hoà Hội
24,Tỉnh Gia Lai,50713,Huyện Phù Cát,50713025,Xã Hội Sơn
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709026,Xã Phù Mỹ
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709027,Xã An Lương
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709028,Xã Bình Dương
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709029,Xã Phù Mỹ Đông
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709030,Xã Phù Mỹ Tây
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709031,Xã Phù Mỹ Nam
24,Tỉnh Gia Lai,50709,Huyện Phù Mỹ,50709032,Xã Phù Mỹ Bắc
24,Tỉnh Gia Lai,50719,Huyện Tuy Phước,50719033,Xã Tuy Phước
24,Tỉnh Gia Lai,50719,Huyện Tuy Phước,50719034,Xã Tuy Phước Đông
24,Tỉnh Gia Lai,50719,Huyện Tuy Phước,50719035,Xã Tuy Phước Tây
24,Tỉnh Gia Lai,50719,Huyện Tuy Phước,50719036,Xã Tuy Phước Bắc
24,Tỉnh Gia Lai,50715,Huyện Tây Sơn,50715037,Xã Tây Sơn
24,Tỉnh Gia Lai,50715,Huyện Tây Sơn,50715038,Xã Bình Khê
24,Tỉnh Gia Lai,50715,Huyện Tây Sơn,50715039,Xã Bình Phú
24,Tỉnh Gia Lai,50715,Huyện Tây Sơn,50715040,Xã Bình Hiệp
24,Tỉnh Gia Lai,50715,Huyện Tây Sơn,50715041,Xã Bình An
24,Tỉnh Gia Lai,50707,Huyện Hoài Ân,50707042,Xã Hoài Ân
24,Tỉnh Gia Lai,50707,Huyện Hoài Ân,50707043,Xã Ân Tường
24,Tỉnh Gia Lai,50707,Huyện Hoài Ân,50707044,Xã Kim Sơn
24,Tỉnh Gia Lai,50707,Huyện Hoài Ân,50707045,Xã Vạn Đức
24,Tỉnh Gia Lai,50707,Huyện Hoài Ân,50707046,Xã Ân Hảo
24,Tỉnh Gia Lai,50721,Huyện Vân Canh,50721047,Xã Vân Canh
24,Tỉnh Gia Lai,50721,Huyện Vân Canh,50721048,Xã Canh Vinh
24,Tỉnh Gia Lai,50721,Huyện Vân Canh,50721049,Xã Canh Liên
24,Tỉnh Gia Lai,50711,Huyện Vĩnh Thạnh,50711050,Xã Vĩnh Thạnh
24,Tỉnh Gia Lai,50711,Huyện Vĩnh Thạnh,50711051,Xã Vĩnh Thịnh
24,Tỉnh Gia Lai,50711,Huyện Vĩnh Thạnh,50711052,Xã Vĩnh Quang
24,Tỉnh Gia Lai,50711,Huyện Vĩnh Thạnh,50711053,Xã Vĩnh Sơn
24,Tỉnh Gia Lai,50703,Huyện An Lão,50703054,Xã An Hoà
24,Tỉnh Gia Lai,50703,Huyện An Lão,50703055,Xã An Lão
24,Tỉnh Gia Lai,50703,Huyện An Lão,50703056,Xã An Vinh
24,Tỉnh Gia Lai,50703,Huyện An Lão,50703057,Xã An Toàn
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301058,Phường Pleiku
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301059,Phường Hội Phú
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301060,Phường Thống Nhất
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301061,Phường Diên Hồng
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301062,Phường An Phú
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301063,Xã Biển Hồ
24,Tỉnh Gia Lai,60301,Thành phố Pleiku,60301064,Xã Gào
24,Tỉnh Gia Lai,60307,Huyện Chư Păh,60307065,Xã Ia Ly
24,Tỉnh Gia Lai,60307,Huyện Chư Păh,60307066,Xã Chư Păh
24,Tỉnh Gia Lai,60307,Huyện Chư Păh,60307067,Xã Ia Khươl
24,Tỉnh Gia Lai,60307,Huyện Chư Păh,60307068,Xã Ia Phí
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317069,Xã Chư Prông
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317070,Xã Bàu Cạn
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317071,Xã Ia Boòng
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317072,Xã Ia Lâu
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317073,Xã Ia Pia
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317074,Xã Ia Tôr
24,Tỉnh Gia Lai,60319,Huyện Chư Sê,60319075,Xã Chư Sê
24,Tỉnh Gia Lai,60319,Huyện Chư Sê,60319076,Xã Bờ Ngoong
24,Tỉnh Gia Lai,60319,Huyện Chư Sê,60319077,Xã Ia Ko
24,Tỉnh Gia Lai,60319,Huyện Chư Sê,60319078,Xã Albá
24,Tỉnh Gia Lai,60331,Huyện Chư Pưh,60331079,Xã Chư Pưh
24,Tỉnh Gia Lai,60331,Huyện Chư Pưh,60331080,Xã Ia Le
24,Tỉnh Gia Lai,60331,Huyện Chư Pưh,60331081,Xã Ia Hrú
24,Tỉnh Gia Lai,60311,Thị xã An Khê,60311082,Phường An Khê
24,Tỉnh Gia Lai,60311,Thị xã An Khê,60311083,Phường An Bình
24,Tỉnh Gia Lai,60311,Thị xã An Khê,60311084,Xã Cửu An
24,Tỉnh Gia Lai,60327,Huyện ĐakPơ,60327085,Xã Đak Pơ
24,Tỉnh Gia Lai,60327,Huyện ĐakPơ,60327086,Xã Ya Hội
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303087,Xã Kbang
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303088,Xã Kông Bơ La
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303089,Xã Tơ Tung
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303090,Xã Sơn Lang
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303091,Xã Đak Rong
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313092,Xã Kông Chro
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313093,Xã Ya Ma
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313094,Xã Chư Krey
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313095,Xã SRó
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313096,Xã Đăk Song
24,Tỉnh Gia Lai,60313,Huyện Kông Chro,60313097,Xã Chơ Long
24,Tỉnh Gia Lai,60321,Thị xã Ayun Pa,60321098,Phường Ayun Pa
24,Tỉnh Gia Lai,60321,Thị xã Ayun Pa,60321099,Xã Ia Rbol
24,Tỉnh Gia Lai,60321,Thị xã Ayun Pa,60321100,Xã Ia Sao
24,Tỉnh Gia Lai,60329,Huyện Phú Thiện,60329101,Xã Phú Thiện
24,Tỉnh Gia Lai,60329,Huyện Phú Thiện,60329102,Xã Chư A Thai
24,Tỉnh Gia Lai,60329,Huyện Phú Thiện,60329103,Xã Ia Hiao
24,Tỉnh Gia Lai,60320,Huyện IaPa,60320104,Xã Pờ Tó
24,Tỉnh Gia Lai,60320,Huyện IaPa,60320105,Xã Ia Pa
24,Tỉnh Gia Lai,60320,Huyện IaPa,60320106,Xã Ia Tul
24,Tỉnh Gia Lai,60323,Huyện Krông Pa,60323107,Xã Phú Túc
24,Tỉnh Gia Lai,60323,Huyện Krông Pa,60323108,Xã Ia Dreh
24,Tỉnh Gia Lai,60323,Huyện Krông Pa,60323109,Xã Ia Rsai
24,Tỉnh Gia Lai,60323,Huyện Krông Pa,60323110,Xã Uar
24,Tỉnh Gia Lai,60325,Huyện Đak Đoa,60325111,Xã Đak Đoa
24,Tỉnh Gia Lai,60325,Huyện Đak Đoa,60325112,Xã Kon Gang
24,Tỉnh Gia Lai,60325,Huyện Đak Đoa,60325113,Xã Ia Băng
24,Tỉnh Gia Lai,60325,Huyện Đak Đoa,60325114,Xã KDang
24,Tỉnh Gia Lai,60325,Huyện Đak Đoa,60325115,Xã Đak Sơmei
24,Tỉnh Gia Lai,60305,Huyện Mang Yang,60305116,Xã Mang Yang
24,Tỉnh Gia Lai,60305,Huyện Mang Yang,60305117,Xã Lơ Pang
24,Tỉnh Gia Lai,60305,Huyện Mang Yang,60305118,Xã Kon Chiêng
24,Tỉnh Gia Lai,60305,Huyện Mang Yang,60305119,Xã Hra
24,Tỉnh Gia Lai,60305,Huyện Mang Yang,60305120,Xã Ayun
24,Tỉnh Gia Lai,60309,Huyện Ia Grai,60309121,Xã Ia Grai
24,Tỉnh Gia Lai,60309,Huyện Ia Grai,60309122,Xã Ia Krái
24,Tỉnh Gia Lai,60309,Huyện Ia Grai,60309123,Xã Ia Hrung
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315124,Xã Đức Cơ
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315125,Xã Ia Dơk
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315126,Xã Ia Krêl
24,Tỉnh Gia Lai,50701,Thành phố Quy Nhơn,50701127,Xã Nhơn Châu
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317128,Xã Ia Púch
24,Tỉnh Gia Lai,60317,Huyện Chư Prông,60317129,Xã Ia Mơ
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315130,Xã Ia Pnôn
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315131,Xã Ia Nan
24,Tỉnh Gia Lai,60315,Huyện Đức Cơ,60315132,Xã Ia Dom
24,Tỉnh Gia Lai,60309,Huyện Ia Grai,60309133,Xã Ia Chia
24,Tỉnh Gia Lai,60309,Huyện Ia Grai,60309134,Xã Ia O
24,Tỉnh Gia Lai,60303,Huyện Kbang,60303135,Xã Krong
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501001,Xã Hoà Phú
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501002,Phường Buôn Ma Thuột
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501003,Phường Tân An
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501004,Phường Tân Lập
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501005,Phường Thành Nhất
25,Tỉnh Đắk Lắk,60501,TP.Buôn Ma Thuột,60501006,Phường Ea Kao
25,Tỉnh Đắk Lắk,60509,Thị xã Buôn Hồ,60509007,Xã Ea Drông
25,Tỉnh Đắk Lắk,60509,Thị xã Buôn Hồ,60509008,Phường Buôn Hồ
25,Tỉnh Đắk Lắk,60509,Thị xã Buôn Hồ,60509009,Phường Cư Bao
25,Tỉnh Đắk Lắk,60505,Huyện Ea Súp,60505010,Xã Ea Súp
25,Tỉnh Đắk Lắk,60505,Huyện Ea Súp,60505011,Xã Ea Rốk
25,Tỉnh Đắk Lắk,60505,Huyện Ea Súp,60505012,Xã Ea Bung
25,Tỉnh Đắk Lắk,60505,Huyện Ea Súp,60505013,Xã Ia Rvê
25,Tỉnh Đắk Lắk,60505,Huyện Ea Súp,60505014,Xã Ia Lốp
25,Tỉnh Đắk Lắk,60511,Huyện Buôn Đôn,60511015,Xã Ea Wer
25,Tỉnh Đắk Lắk,60511,Huyện Buôn Đôn,60511016,Xã Ea Nuôl
25,Tỉnh Đắk Lắk,60511,Huyện Buôn Đôn,60511017,Xã Buôn Đôn
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513018,Xã Ea Kiết
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513019,Xã Ea M’Droh
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513020,Xã Quảng Phú
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513021,Xã Cuôr Đăng
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513022,Xã Cư M’gar
25,Tỉnh Đắk Lắk,60513,Huyện Cư M'gar,60513023,Xã Ea Tul
25,Tỉnh Đắk Lắk,60539,Huyện Krông Buk,60539024,Xã Pơng Drang
25,Tỉnh Đắk Lắk,60539,Huyện Krông Buk,60539025,Xã Krông Búk
25,Tỉnh Đắk Lắk,60539,Huyện Krông Buk,60539026,Xã Cư Pơng
25,Tỉnh Đắk Lắk,60503,Huyện Ea H'leo,60503027,Xã Ea Khăl
25,Tỉnh Đắk Lắk,60503,Huyện Ea H'leo,60503028,Xã Ea Drăng
25,Tỉnh Đắk Lắk,60503,Huyện Ea H'leo,60503029,Xã Ea Wy
25,Tỉnh Đắk Lắk,60503,Huyện Ea H'leo,60503030,Xã Ea H’leo
25,Tỉnh Đắk Lắk,60503,Huyện Ea H'leo,60503031,Xã Ea Hiao
25,Tỉnh Đắk Lắk,60507,Huyện Krông Năng,60507032,Xã Krông Năng
25,Tỉnh Đắk Lắk,60507,Huyện Krông Năng,60507033,Xã Dliê Ya
25,Tỉnh Đắk Lắk,60507,Huyện Krông Năng,60507034,Xã Tam Giang
25,Tỉnh Đắk Lắk,60507,Huyện Krông Năng,60507035,Xã Phú Xuân
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519036,Xã Krông Pắc
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519037,Xã Ea Knuếc
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519038,Xã Tân Tiến
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519039,Xã Ea Phê
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519040,Xã Ea Kly
25,Tỉnh Đắk Lắk,60519,Huyện Krông Pắc,60519041,Xã Vụ Bổn
25,Tỉnh Đắk Lắk,60515,Huyện Ea Kar,60515042,Xã Ea Kar
25,Tỉnh Đắk Lắk,60515,Huyện Ea Kar,60515043,Xã Ea Ô
25,Tỉnh Đắk Lắk,60515,Huyện Ea Kar,60515044,Xã Ea Knốp
25,Tỉnh Đắk Lắk,60515,Huyện Ea Kar,60515045,Xã Cư Yang
25,Tỉnh Đắk Lắk,60515,Huyện Ea Kar,60515046,Xã Ea Păl
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517047,Xã M’Drắk
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517048,Xã Ea Riêng
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517049,Xã Cư M’ta
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517050,Xã Krông Á
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517051,Xã Cư Prao
25,Tỉnh Đắk Lắk,60517,Huyện M'ĐrắK,60517052,Xã Ea Trang
25,Tỉnh Đắk Lắk,60525,Huyện Krông Bông,60525053,Xã Hoà Sơn
25,Tỉnh Đắk Lắk,60525,Huyện Krông Bông,60525054,Xã Dang Kang
25,Tỉnh Đắk Lắk,60525,Huyện Krông Bông,60525055,Xã Krông Bông
25,Tỉnh Đắk Lắk,60525,Huyện Krông Bông,60525056,Xã Yang Mao
25,Tỉnh Đắk Lắk,60525,Huyện Krông Bông,60525057,Xã Cư Pui
25,Tỉnh Đắk Lắk,60531,Huyện Lắk,60531058,Xã Liên Sơn Lắk
25,Tỉnh Đắk Lắk,60531,Huyện Lắk,60531059,Xã Đắk Liêng
25,Tỉnh Đắk Lắk,60531,Huyện Lắk,60531060,Xã Nam Ka
25,Tỉnh Đắk Lắk,60531,Huyện Lắk,60531061,Xã Đắk Phơi
25,Tỉnh Đắk Lắk,60531,Huyện Lắk,60531062,Xã Krông Nô
25,Tỉnh Đắk Lắk,60537,Huyện Cư Kuin,60537063,Xã Ea Ning
25,Tỉnh Đắk Lắk,60537,Huyện Cư Kuin,60537064,Xã Dray Bhăng
25,Tỉnh Đắk Lắk,60537,Huyện Cư Kuin,60537065,Xã Ea Ktur
25,Tỉnh Đắk Lắk,60523,Huyện Krông A Na,60523066,Xã Krông Ana
25,Tỉnh Đắk Lắk,60523,Huyện Krông A Na,60523067,Xã Dur Kmăl
25,Tỉnh Đắk Lắk,60523,Huyện Krông A Na,60523068,Xã Ea Na
25,Tỉnh Đắk Lắk,50901,Thành phố Tuy Hoà,50901069,Phường Tuy Hòa
25,Tỉnh Đắk Lắk,50901,Thành phố Tuy Hoà,50901070,Phường Phú Yên
25,Tỉnh Đắk Lắk,50901,Thành phố Tuy Hoà,50901071,Phường Bình Kiến
25,Tỉnh Đắk Lắk,50905,Thị xã Sông Cầu,50905072,Xã Xuân Thọ
25,Tỉnh Đắk Lắk,50905,Thị xã Sông Cầu,50905073,Xã Xuân Cảnh
25,Tỉnh Đắk Lắk,50905,Thị xã Sông Cầu,50905074,Xã Xuân Lộc
25,Tỉnh Đắk Lắk,50905,Thị xã Sông Cầu,50905075,Phường Xuân Đài
25,Tỉnh Đắk Lắk,50905,Thị xã Sông Cầu,50905076,Phường Sông Cầu
25,Tỉnh Đắk Lắk,50911,Thị xã Đông Hòa,50911077,Xã Hòa Xuân
25,Tỉnh Đắk Lắk,50911,Thị xã Đông Hòa,50911078,Phường Đông Hòa
25,Tỉnh Đắk Lắk,50911,Thị xã Đông Hòa,50911079,Phường Hòa Hiệp
25,Tỉnh Đắk Lắk,50907,Huyện Tuy An,50907080,Xã Tuy An Bắc
25,Tỉnh Đắk Lắk,50907,Huyện Tuy An,50907081,Xã Tuy An Đông
25,Tỉnh Đắk Lắk,50907,Huyện Tuy An,50907082,Xã Ô Loan
25,Tỉnh Đắk Lắk,50907,Huyện Tuy An,50907083,Xã Tuy An Nam
25,Tỉnh Đắk Lắk,50907,Huyện Tuy An,50907084,Xã Tuy An Tây
25,Tỉnh Đắk Lắk,50915,Huyện Phú Hoà,50915085,Xã Phú Hòa 1
25,Tỉnh Đắk Lắk,50915,Huyện Phú Hoà,50915086,Xã Phú Hòa 2
25,Tỉnh Đắk Lắk,50912,Huyện Tây Hoà,50912087,Xã Tây Hòa
25,Tỉnh Đắk Lắk,50912,Huyện Tây Hoà,50912088,Xã Hòa Thịnh
25,Tỉnh Đắk Lắk,50912,Huyện Tây Hoà,50912089,Xã Hòa Mỹ
25,Tỉnh Đắk Lắk,50912,Huyện Tây Hoà,50912090,Xã Sơn Thành
25,Tỉnh Đắk Lắk,50909,Huyện Sơn Hoà,50909091,Xã Sơn Hòa
25,Tỉnh Đắk Lắk,50909,Huyện Sơn Hoà,50909092,Xã Vân Hòa
25,Tỉnh Đắk Lắk,50909,Huyện Sơn Hoà,50909093,Xã Tây Sơn
25,Tỉnh Đắk Lắk,50909,Huyện Sơn Hoà,50909094,Xã Suối Trai
25,Tỉnh Đắk Lắk,50913,Huyện Sông Hinh,50913095,Xã Ea Ly
25,Tỉnh Đắk Lắk,50913,Huyện Sông Hinh,50913096,Xã Ea Bá
25,Tỉnh Đắk Lắk,50913,Huyện Sông Hinh,50913097,Xã Đức Bình
25,Tỉnh Đắk Lắk,50913,Huyện Sông Hinh,50913098,Xã Sông Hinh
25,Tỉnh Đắk Lắk,50903,Huyện Đồng Xuân,50903099,Xã Xuân Lãnh
25,Tỉnh Đắk Lắk,50903,Huyện Đồng Xuân,50903100,Xã Phú Mỡ
25,Tỉnh Đắk Lắk,50903,Huyện Đồng Xuân,50903101,Xã Xuân Phước
25,Tỉnh Đắk Lắk,50903,Huyện Đồng Xuân,50903102,Xã Đồng Xuân
26,Tỉnh Lâm Đồng,70301,Thành phố Đà Lạt,70301001,Phường Xuân Hương - Đà Lạt
26,Tỉnh Lâm Đồng,70301,Thành phố Đà Lạt,70301002,Phường Cam Ly - Đà Lạt
26,Tỉnh Lâm Đồng,70301,Thành phố Đà Lạt,70301003,Phường Lâm Viên - Đà Lạt
26,Tỉnh Lâm Đồng,70301,Thành phố Đà Lạt,70301004,Phường Xuân Trường - Đà Lạt
26,Tỉnh Lâm Đồng,70305,Huyện Lạc Dương,70305005,Phường Langbiang - Đà Lạt
26,Tỉnh Lâm Đồng,70303,Thành phố Bảo Lộc,70303006,Phường 1 Bảo Lộc
26,Tỉnh Lâm Đồng,70303,Thành phố Bảo Lộc,70303007,Phường 2 Bảo Lộc
26,Tỉnh Lâm Đồng,70303,Thành phố Bảo Lộc,70303008,Phường 3 Bảo Lộc
26,Tỉnh Lâm Đồng,70303,Thành phố Bảo Lộc,70303009,Phường B' Lao
26,Tỉnh Lâm Đồng,70305,Huyện Lạc Dương,70305010,Xã Lạc Dương
26,Tỉnh Lâm Đồng,70307,Huyện Đơn Dương,70307011,Xã Đơn Dương
26,Tỉnh Lâm Đồng,70307,Huyện Đơn Dương,70307012,Xã Ka Đô
26,Tỉnh Lâm Đồng,70307,Huyện Đơn Dương,70307013,Xã Quảng Lập
26,Tỉnh Lâm Đồng,70307,Huyện Đơn Dương,70307014,Xã D'Ran
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309015,Xã Hiệp Thạnh
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309016,Xã Đức Trọng
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309017,Xã Tân Hội
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309018,Xã Tà Hine
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309019,Xã Tà Năng
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311020,Xã Đinh Văn - Lâm Hà
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311021,Xã Phú Sơn - Lâm Hà
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311022,Xã Nam Hà - Lâm Hà
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311023,Xã Nam Ban - Lâm Hà
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311024,Xã Tân Hà - Lâm Hà
26,Tỉnh Lâm Đồng,70311,Huyện Lâm Hà,70311025,Xã Phúc Thọ - Lâm Hà
26,Tỉnh Lâm Đồng,70323,Huyện Đam Rông,70323026,Xã Đam Rông 1
26,Tỉnh Lâm Đồng,70323,Huyện Đam Rông,70323027,Xã Đam Rông 2
26,Tỉnh Lâm Đồng,70323,Huyện Đam Rông,70323028,Xã Đam Rông 3
26,Tỉnh Lâm Đồng,70323,Huyện Đam Rông,70323029,Xã Đam Rông 4
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315030,Xã Di Linh
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315031,Xã Hoà Ninh
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315032,Xã Hoà Bắc
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315033,Xã Đinh Trang Thượng
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315034,Xã Bảo Thuận
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315035,Xã Sơn Điền
26,Tỉnh Lâm Đồng,70315,Huyện Di Linh,70315036,Xã Gia Hiệp
26,Tỉnh Lâm Đồng,70313,Huyện Bảo Lâm,70313037,Xã Bảo Lâm 1
26,Tỉnh Lâm Đồng,70313,Huyện Bảo Lâm,70313038,Xã Bảo Lâm 2
26,Tỉnh Lâm Đồng,70313,Huyện Bảo Lâm,70313039,Xã Bảo Lâm 3
26,Tỉnh Lâm Đồng,70313,Huyện Bảo Lâm,70313040,Xã Bảo Lâm 4
26,Tỉnh Lâm Đồng,70313,Huyện Bảo Lâm,70313041,Xã Bảo Lâm 5
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317042,Xã Đạ Huoai
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317043,Xã Đạ Huoai 2
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317044,Xã Đạ Huoai 3
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317045,Xã Đạ Tẻh
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317046,Xã Đạ Tẻh 2
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317047,Xã Đạ Tẻh 3
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317048,Xã Cát Tiên
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317049,Xã Cát Tiên 2
26,Tỉnh Lâm Đồng,70317,Huyện Đạ Huoai,70317050,Xã Cát Tiên 3
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501051,Phường Hàm Thắng
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501052,Phường Bình Thuận
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501053,Phường Mũi Né
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501054,Phường Phú Thuỷ
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501055,Phường Phan Thiết
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501056,Phường Tiến Thành
26,Tỉnh Lâm Đồng,71513,Thị xã La Gi,71513057,Phường La Gi
26,Tỉnh Lâm Đồng,71513,Thị xã La Gi,71513058,Phường Phước Hội
26,Tỉnh Lâm Đồng,71501,Thành phố Phan Thiết,71501059,Xã Tuyên Quang
26,Tỉnh Lâm Đồng,71513,Thị xã La Gi,71513060,Xã Tân Hải
26,Tỉnh Lâm Đồng,71503,Huyện Tuy Phong,71503061,Xã Vĩnh Hảo
26,Tỉnh Lâm Đồng,71503,Huyện Tuy Phong,71503062,Xã Liên Hương
26,Tỉnh Lâm Đồng,71503,Huyện Tuy Phong,71503063,Xã Tuy Phong
26,Tỉnh Lâm Đồng,71503,Huyện Tuy Phong,71503064,Xã Phan Rí Cửa
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505065,Xã Bắc Bình
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505066,Xã Hồng Thái
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505067,Xã Hải Ninh
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505068,Xã Phan Sơn
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505069,Xã Sông Lũy
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505070,Xã Lương Sơn
26,Tỉnh Lâm Đồng,71505,Huyện Bắc Bình,71505071,Xã Hoà Thắng
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507072,Xã Đông Giang
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507073,Xã La Dạ
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507074,Xã Hàm Thuận Bắc
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507075,Xã Hàm Thuận
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507076,Xã Hồng Sơn
26,Tỉnh Lâm Đồng,71507,Huyện Hàm Thuận Bắc,71507077,Xã Hàm Liêm
26,Tỉnh Lâm Đồng,71509,Huyện Hàm Thuận Nam,71509078,Xã Hàm Thạnh
26,Tỉnh Lâm Đồng,71509,Huyện Hàm Thuận Nam,71509079,Xã Hàm Kiệm
26,Tỉnh Lâm Đồng,71509,Huyện Hàm Thuận Nam,71509080,Xã Tân Thành
26,Tỉnh Lâm Đồng,71509,Huyện Hàm Thuận Nam,71509081,Xã Hàm Thuận Nam
26,Tỉnh Lâm Đồng,71509,Huyện Hàm Thuận Nam,71509082,Xã Tân Lập
26,Tỉnh Lâm Đồng,71514,Huyện Hàm Tân,71514083,Xã Tân Minh
26,Tỉnh Lâm Đồng,71514,Huyện Hàm Tân,71514084,Xã Hàm Tân
26,Tỉnh Lâm Đồng,71514,Huyện Hàm Tân,71514085,Xã Sơn Mỹ
26,Tỉnh Lâm Đồng,71511,Huyện Tánh Linh,71511086,Xã Bắc Ruộng
26,Tỉnh Lâm Đồng,71511,Huyện Tánh Linh,71511087,Xã Nghị Đức
26,Tỉnh Lâm Đồng,71511,Huyện Tánh Linh,71511088,Xã Đồng Kho
26,Tỉnh Lâm Đồng,71511,Huyện Tánh Linh,71511089,Xã Tánh Linh
26,Tỉnh Lâm Đồng,71511,Huyện Tánh Linh,71511090,Xã Suối Kiết
26,Tỉnh Lâm Đồng,71515,Huyện Đức Linh,71515091,Xã Nam Thành
26,Tỉnh Lâm Đồng,71515,Huyện Đức Linh,71515092,Xã Đức Linh
26,Tỉnh Lâm Đồng,71515,Huyện Đức Linh,71515093,Xã Hoài Đức
26,Tỉnh Lâm Đồng,71515,Huyện Đức Linh,71515094,Xã Trà Tân
26,Tỉnh Lâm Đồng,71517,Huyện Phú Quý,71517095,Đặc khu Phú Quý
26,Tỉnh Lâm Đồng,60613,Thành phố Gia Nghĩa,60613096,Phường Bắc Gia Nghĩa
26,Tỉnh Lâm Đồng,60613,Thành phố Gia Nghĩa,60613097,Phường Nam Gia Nghĩa
26,Tỉnh Lâm Đồng,60613,Thành phố Gia Nghĩa,60613098,Phường Đông Gia Nghĩa
26,Tỉnh Lâm Đồng,60603,Huyện Cư Jút,60603099,Xã Đắk Wil
26,Tỉnh Lâm Đồng,60603,Huyện Cư Jút,60603100,Xã Nam Dong
26,Tỉnh Lâm Đồng,60603,Huyện Cư Jút,60603101,Xã Cư Jút
26,Tỉnh Lâm Đồng,60607,Huyện Đắk Mil,60607102,Xã Thuận An
26,Tỉnh Lâm Đồng,60607,Huyện Đắk Mil,60607103,Xã Đức Lập
26,Tỉnh Lâm Đồng,60607,Huyện Đắk Mil,60607104,Xã Đắk Mil
26,Tỉnh Lâm Đồng,60607,Huyện Đắk Mil,60607105,Xã Đắk Sắk
26,Tỉnh Lâm Đồng,60605,Huyện Krông Nô,60605106,Xã Nam Đà
26,Tỉnh Lâm Đồng,60605,Huyện Krông Nô,60605107,Xã Krông Nô
26,Tỉnh Lâm Đồng,60605,Huyện Krông Nô,60605108,Xã Nâm Nung
26,Tỉnh Lâm Đồng,60605,Huyện Krông Nô,60605109,Xã Quảng Phú
26,Tỉnh Lâm Đồng,60609,Huyện Đắk Song,60609110,Xã Đắk song
26,Tỉnh Lâm Đồng,60609,Huyện Đắk Song,60609111,Xã Đức An
26,Tỉnh Lâm Đồng,60609,Huyện Đắk Song,60609112,Xã Thuận Hạnh
26,Tỉnh Lâm Đồng,60609,Huyện Đắk Song,60609113,Xã Trường Xuân
26,Tỉnh Lâm Đồng,60615,Huyện Đắk Glong,60615114,Xã Tà Đùng
26,Tỉnh Lâm Đồng,60615,Huyện Đắk Glong,60615115,Xã Quảng Khê
26,Tỉnh Lâm Đồng,60617,Huyện Tuy Đức,60617116,Xã Quảng Tân
26,Tỉnh Lâm Đồng,60617,Huyện Tuy Đức,60617117,Xã Tuy Đức
26,Tỉnh Lâm Đồng,60611,Huyện Đắk R'Lấp,60611118,Xã Kiến Đức
26,Tỉnh Lâm Đồng,60611,Huyện Đắk R'Lấp,60611119,Xã Nhân Cơ
26,Tỉnh Lâm Đồng,60611,Huyện Đắk R'Lấp,60611120,Xã Quảng Tín
26,Tỉnh Lâm Đồng,70309,Huyện Đức Trọng,70309121,Xã Ninh Gia
26,Tỉnh Lâm Đồng,60615,Huyện Đắk Glong,60615122,Xã Quảng Hoà
26,Tỉnh Lâm Đồng,60615,Huyện Đắk Glong,60615123,Xã Quảng Sơn
26,Tỉnh Lâm Đồng,60617,Huyện Tuy Đức,60617124,Xã Quảng Trực
27,Tỉnh Tây Ninh,80103,Huyện Tân Hưng,80103001,Xã Hưng Điền
27,Tỉnh Tây Ninh,80103,Huyện Tân Hưng,80103002,Xã Vĩnh Thạnh
27,Tỉnh Tây Ninh,80103,Huyện Tân Hưng,80103003,Xã Tân Hưng
27,Tỉnh Tây Ninh,80103,Huyện Tân Hưng,80103004,Xã Vĩnh Châu
27,Tỉnh Tây Ninh,80105,Huyện Vĩnh Hưng,80105005,Xã Tuyên Bình
27,Tỉnh Tây Ninh,80105,Huyện Vĩnh Hưng,80105006,Xã Vĩnh Hưng
27,Tỉnh Tây Ninh,80105,Huyện Vĩnh Hưng,80105007,Xã Khánh Hưng
27,Tỉnh Tây Ninh,80129,Thị xã Kiến Tường,80129008,Xã Tuyên Thạnh
27,Tỉnh Tây Ninh,80129,Thị xã Kiến Tường,80129009,Xã Bình Hiệp
27,Tỉnh Tây Ninh,80129,Thị xã Kiến Tường,80129010,Phường Kiến Tường
27,Tỉnh Tây Ninh,80107,Huyện Mộc Hoá,80107011,Xã Bình Hoà
27,Tỉnh Tây Ninh,80107,Huyện Mộc Hoá,80107012,Xã Mộc Hoá
27,Tỉnh Tây Ninh,80109,Huyện Tân Thạnh,80109013,Xã Hậu Thạnh
27,Tỉnh Tây Ninh,80109,Huyện Tân Thạnh,80109014,Xã Nhơn Hoà Lập
27,Tỉnh Tây Ninh,80109,Huyện Tân Thạnh,80109015,Xã Nhơn Ninh
27,Tỉnh Tây Ninh,80109,Huyện Tân Thạnh,80109016,Xã Tân Thạnh
27,Tỉnh Tây Ninh,80111,Huyện Thạnh Hoá,80111017,Xã Bình Thành
27,Tỉnh Tây Ninh,80111,Huyện Thạnh Hoá,80111018,Xã Thạnh Phước
27,Tỉnh Tây Ninh,80111,Huyện Thạnh Hoá,80111019,Xã Thạnh Hóa
27,Tỉnh Tây Ninh,80111,Huyện Thạnh Hoá,80111020,Xã Tân Tây
27,Tỉnh Tây Ninh,80119,Huyện Thủ Thừa,80119021,Xã Thủ Thừa
27,Tỉnh Tây Ninh,80119,Huyện Thủ Thừa,80119022,Xã Mỹ An
27,Tỉnh Tây Ninh,80119,Huyện Thủ Thừa,80119023,Xã Mỹ Thạnh
27,Tỉnh Tây Ninh,80119,Huyện Thủ Thừa,80119024,Xã Tân Long
27,Tỉnh Tây Ninh,80113,Huyện Đức Huệ,80113025,Xã Mỹ Quý
27,Tỉnh Tây Ninh,80113,Huyện Đức Huệ,80113026,Xã Đông Thành
27,Tỉnh Tây Ninh,80113,Huyện Đức Huệ,80113027,Xã Đức Huệ
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115028,Xã An Ninh
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115029,Xã Hiệp Hoà
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115030,Xã Hậu Nghĩa
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115031,Xã Hoà Khánh
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115032,Xã Đức Lập
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115033,Xã Mỹ Hạnh
27,Tỉnh Tây Ninh,80115,Huyện Đức Hoà,80115034,Xã Đức Hoà
27,Tỉnh Tây Ninh,80117,Huyện Bến Lức,80117035,Xã Thạnh Lợi
27,Tỉnh Tây Ninh,80117,Huyện Bến Lức,80117036,Xã Bình Đức
27,Tỉnh Tây Ninh,80117,Huyện Bến Lức,80117037,Xã Lương Hoà
27,Tỉnh Tây Ninh,80117,Huyện Bến Lức,80117038,Xã Bến Lức
27,Tỉnh Tây Ninh,80117,Huyện Bến Lức,80117039,Xã Mỹ Yên
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125040,Xã Long Cang
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125041,Xã Rạch Kiến
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125042,Xã Mỹ Lệ
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125043,Xã Tân Lân
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125044,Xã Cần Đước
27,Tỉnh Tây Ninh,80125,Huyện Cần Đước,80125045,Xã Long Hựu
27,Tỉnh Tây Ninh,80127,Huyện Cần Giuộc,80127046,Xã Phước Lý
27,Tỉnh Tây Ninh,80127,Huyện Cần Giuộc,80127047,Xã Mỹ Lộc
27,Tỉnh Tây Ninh,80127,Huyện Cần Giuộc,80127048,Xã Cần Giuộc
27,Tỉnh Tây Ninh,80127,Huyện Cần Giuộc,80127049,Xã Phước Vĩnh Tây
27,Tỉnh Tây Ninh,80127,Huyện Cần Giuộc,80127050,Xã Tân Tập
27,Tỉnh Tây Ninh,80123,Huyện Tân Trụ,80123051,Xã Vàm Cỏ
27,Tỉnh Tây Ninh,80123,Huyện Tân Trụ,80123052,Xã Tân Trụ
27,Tỉnh Tây Ninh,80123,Huyện Tân Trụ,80123053,Xã Nhựt Tảo
27,Tỉnh Tây Ninh,80121,Huyện Châu Thành,80121054,Xã Thuận Mỹ
27,Tỉnh Tây Ninh,80121,Huyện Châu Thành,80121055,Xã An Lục Long
27,Tỉnh Tây Ninh,80121,Huyện Châu Thành,80121056,Xã Tầm Vu
27,Tỉnh Tây Ninh,80121,Huyện Châu Thành,80121057,Xã Vĩnh Công
27,Tỉnh Tây Ninh,80101,Thành phố Tân An,80101058,Phường Long An
27,Tỉnh Tây Ninh,80101,Thành phố Tân An,80101059,Phường Tân An
27,Tỉnh Tây Ninh,80101,Thành phố Tân An,80101060,Phường Khánh Hậu
27,Tỉnh Tây Ninh,70901,Thành phố Tây Ninh,70901061,Phường Tân Ninh
27,Tỉnh Tây Ninh,70901,Thành phố Tây Ninh,70901062,Phường Bình Minh
27,Tỉnh Tây Ninh,70907,Huyện Dương Minh Châu,70907063,Phường Ninh Thạnh
27,Tỉnh Tây Ninh,70911,Thị xã Hoà Thành,70911064,Phường Long Hoa
27,Tỉnh Tây Ninh,70911,Thị xã Hoà Thành,70911065,Phường Hoà Thành
27,Tỉnh Tây Ninh,70911,Thị xã Hoà Thành,70911066,Phường Thanh Điền
27,Tỉnh Tây Ninh,70917,Thị xã Trảng Bàng,70917067,Phường Trảng Bàng
27,Tỉnh Tây Ninh,70917,Thị xã Trảng Bàng,70917068,Phường An Tịnh
27,Tỉnh Tây Ninh,70915,Huyện Gò Dầu,70915069,Phường Gò Dầu
27,Tỉnh Tây Ninh,70915,Huyện Gò Dầu,70915070,Phường Gia Lộc
27,Tỉnh Tây Ninh,70917,Thị xã Trảng Bàng,70917071,Xã Hưng Thuận
27,Tỉnh Tây Ninh,70917,Thị xã Trảng Bàng,70917072,Xã Phước Chỉ
27,Tỉnh Tây Ninh,70915,Huyện Gò Dầu,70915073,Xã Thạnh Đức
27,Tỉnh Tây Ninh,70915,Huyện Gò Dầu,70915074,Xã Phước Thạnh
27,Tỉnh Tây Ninh,70915,Huyện Gò Dầu,70915075,Xã Truông Mít
27,Tỉnh Tây Ninh,70907,Huyện Dương Minh Châu,70907076,Xã Lộc Ninh
27,Tỉnh Tây Ninh,70907,Huyện Dương Minh Châu,70907077,Xã Cầu Khởi
27,Tỉnh Tây Ninh,70907,Huyện Dương Minh Châu,70907078,Xã Dương Minh Châu
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905079,Xã Tân Đông
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905080,Xã Tân Châu
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905081,Xã Tân Phú
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905082,Xã Tân Hội
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905083,Xã Tân Thành
27,Tỉnh Tây Ninh,70905,Huyện Tân Châu,70905084,Xã Tân Hoà
27,Tỉnh Tây Ninh,70903,Huyện Tân Biên,70903085,Xã Tân Lập
27,Tỉnh Tây Ninh,70903,Huyện Tân Biên,70903086,Xã Tân Biên
27,Tỉnh Tây Ninh,70903,Huyện Tân Biên,70903087,Xã Thạnh Bình
27,Tỉnh Tây Ninh,70903,Huyện Tân Biên,70903088,Xã Trà Vong
27,Tỉnh Tây Ninh,70909,Huyện Châu Thành,70909089,Xã Phước Vinh
27,Tỉnh Tây Ninh,70909,Huyện Châu Thành,70909090,Xã Hoà Hội
27,Tỉnh Tây Ninh,70909,Huyện Châu Thành,70909091,Xã Ninh Điền
27,Tỉnh Tây Ninh,70909,Huyện Châu Thành,70909092,Xã Châu Thành
27,Tỉnh Tây Ninh,70909,Huyện Châu Thành,70909093,Xã Hảo Đước
27,Tỉnh Tây Ninh,70913,Huyện Bến Cầu,70913094,Xã Long Chữ
27,Tỉnh Tây Ninh,70913,Huyện Bến Cầu,70913095,Xã Long Thuận
27,Tỉnh Tây Ninh,70913,Huyện Bến Cầu,70913096,Xã Bến Cầu
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301001,Phường Biên Hoà
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301002,Phường Trấn Biên
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301003,Phường Tam Hiệp
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301004,Phường Long Bình
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301005,Phường Trảng Dài
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301006,Phường Hố Nai
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301007,Phường Long Hưng
28,Tỉnh Đồng Nai,71317,Huyện Nhơn Trạch,71317008,Xã Đại Phước
28,Tỉnh Đồng Nai,71317,Huyện Nhơn Trạch,71317009,Xã Nhơn Trạch
28,Tỉnh Đồng Nai,71317,Huyện Nhơn Trạch,71317010,Xã Phước An
28,Tỉnh Đồng Nai,71315,Huyện Long Thành,71315011,Xã Phước Thái
28,Tỉnh Đồng Nai,71315,Huyện Long Thành,71315012,Xã Long Phước
28,Tỉnh Đồng Nai,71315,Huyện Long Thành,71315013,Xã Bình An
28,Tỉnh Đồng Nai,71315,Huyện Long Thành,71315014,Xã Long Thành
28,Tỉnh Đồng Nai,71315,Huyện Long Thành,71315015,Xã An Phước
28,Tỉnh Đồng Nai,71308,Huyện Trảng Bom,71308016,Xã An Viễn
28,Tỉnh Đồng Nai,71308,Huyện Trảng Bom,71308017,Xã Bình Minh
28,Tỉnh Đồng Nai,71308,Huyện Trảng Bom,71308018,Xã Trảng Bom
28,Tỉnh Đồng Nai,71308,Huyện Trảng Bom,71308019,Xã Bàu Hàm
28,Tỉnh Đồng Nai,71308,Huyện Trảng Bom,71308020,Xã Hưng Thịnh
28,Tỉnh Đồng Nai,71309,Huyện Thống Nhất,71309021,Xã Dầu Giây
28,Tỉnh Đồng Nai,71309,Huyện Thống Nhất,71309022,Xã Gia Kiệm
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305023,Xã Thống Nhất
28,Tỉnh Đồng Nai,71302,Thành phố Long khánh,71302024,Phường Bình Lộc
28,Tỉnh Đồng Nai,71302,Thành phố Long khánh,71302025,Phường Bảo Vinh
28,Tỉnh Đồng Nai,71302,Thành phố Long khánh,71302026,Phường Xuân Lập
28,Tỉnh Đồng Nai,71302,Thành phố Long khánh,71302027,Phường Long Khánh
28,Tỉnh Đồng Nai,71302,Thành phố Long khánh,71302028,Phường Hàng Gòn
28,Tỉnh Đồng Nai,71311,Huyện Cẩm Mỹ,71311029,Xã Xuân Quế
28,Tỉnh Đồng Nai,71311,Huyện Cẩm Mỹ,71311030,Xã Xuân Đường
28,Tỉnh Đồng Nai,71311,Huyện Cẩm Mỹ,71311031,Xã Cẩm Mỹ
28,Tỉnh Đồng Nai,71311,Huyện Cẩm Mỹ,71311032,Xã Sông Ray
28,Tỉnh Đồng Nai,71311,Huyện Cẩm Mỹ,71311033,Xã Xuân Đông
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313034,Xã Xuân Định
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313035,Xã Xuân Phú
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313036,Xã Xuân Lộc
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313037,Xã Xuân Hoà
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313038,Xã Xuân Thành
28,Tỉnh Đồng Nai,71313,Huyện Xuân Lộc,71313039,Xã Xuân Bắc
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305040,Xã La Ngà
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305041,Xã Định Quán
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305042,Xã Phú Vinh
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305043,Xã Phú Hoà
28,Tỉnh Đồng Nai,71303,Huyện Tân Phú,71303044,Xã Tà Lài
28,Tỉnh Đồng Nai,71303,Huyện Tân Phú,71303045,Xã Nam Cát Tiên
28,Tỉnh Đồng Nai,71303,Huyện Tân Phú,71303046,Xã Tân Phú
28,Tỉnh Đồng Nai,71303,Huyện Tân Phú,71303047,Xã Phú Lâm
28,Tỉnh Đồng Nai,71307,Huyện Vĩnh Cửu,71307048,Xã Trị An
28,Tỉnh Đồng Nai,71307,Huyện Vĩnh Cửu,71307049,Xã Tân An
28,Tỉnh Đồng Nai,71307,Huyện Vĩnh Cửu,71307050,Phường Tân Triều
28,Tỉnh Đồng Nai,70710,Huyện Chơn Thành,70710051,Phường Minh Hưng
28,Tỉnh Đồng Nai,70710,Huyện Chơn Thành,70710052,Phường Chơn Thành
28,Tỉnh Đồng Nai,70710,Huyện Chơn Thành,70710053,Xã Nha Bích
28,Tỉnh Đồng Nai,70713,Huyện Hớn Quản,70713054,Xã Tân Quan
28,Tỉnh Đồng Nai,70713,Huyện Hớn Quản,70713055,Xã Tân Hưng
28,Tỉnh Đồng Nai,70713,Huyện Hớn Quản,70713056,Xã Tân Khai
28,Tỉnh Đồng Nai,70713,Huyện Hớn Quản,70713057,Xã Minh Đức
28,Tỉnh Đồng Nai,70709,Thị xã Bình Long,70709058,Phường Bình Long
28,Tỉnh Đồng Nai,70709,Thị xã Bình Long,70709059,Phường An Lộc
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705060,Xã Lộc Thành
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705061,Xã Lộc Ninh
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705062,Xã Lộc Hưng
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705063,Xã Lộc Tấn
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705064,Xã Lộc Thạnh
28,Tỉnh Đồng Nai,70705,Huyện Lộc Ninh,70705065,Xã Lộc Quang
28,Tỉnh Đồng Nai,70706,Huyện Bù Đốp,70706066,Xã Tân Tiến
28,Tỉnh Đồng Nai,70706,Huyện Bù Đốp,70706067,Xã Thiện Hưng
28,Tỉnh Đồng Nai,70706,Huyện Bù Đốp,70706068,Xã Hưng Phước
28,Tỉnh Đồng Nai,70715,Huyện Bù Gia Mập,70715069,Xã Phú Nghĩa
28,Tỉnh Đồng Nai,70715,Huyện Bù Gia Mập,70715070,Xã Đa Kia
28,Tỉnh Đồng Nai,70703,Thị xã Phước Long,70703071,Phường Phước Bình
28,Tỉnh Đồng Nai,70703,Thị xã Phước Long,70703072,Phường Phước Long
28,Tỉnh Đồng Nai,70716,Huyện Phú Riềng,70716073,Xã Bình Tân
28,Tỉnh Đồng Nai,70716,Huyện Phú Riềng,70716074,Xã Long Hà
28,Tỉnh Đồng Nai,70716,Huyện Phú Riềng,70716075,Xã Phú Riềng
28,Tỉnh Đồng Nai,70716,Huyện Phú Riềng,70716076,Xã Phú Trung
28,Tỉnh Đồng Nai,70711,Thành phố Đồng Xoài,70711077,Phường Đồng Xoài
28,Tỉnh Đồng Nai,70711,Thành phố Đồng Xoài,70711078,Phường Bình Phước
28,Tỉnh Đồng Nai,70701,Huyện Đồng Phú,70701079,Xã Thuận Lợi
28,Tỉnh Đồng Nai,70701,Huyện Đồng Phú,70701080,Xã Đồng Tâm
28,Tỉnh Đồng Nai,70701,Huyện Đồng Phú,70701081,Xã Tân Lợi
28,Tỉnh Đồng Nai,70701,Huyện Đồng Phú,70701082,Xã Đồng Phú
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707083,Xã Phước Sơn
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707084,Xã Nghĩa Trung
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707085,Xã Bù Đăng
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707086,Xã Thọ Sơn
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707087,Xã Đak Nhau
28,Tỉnh Đồng Nai,70707,Huyện Bù Đăng,70707088,Xã Bom Bo
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301089,Phường Tam Phước
28,Tỉnh Đồng Nai,71301,Thành phố Biên Hoà,71301090,Phường Phước Tân
28,Tỉnh Đồng Nai,71305,Huyện Định Quán,71305091,Xã Thanh Sơn
28,Tỉnh Đồng Nai,71303,Huyện Tân Phú,71303092,Xã Đak Lua
28,Tỉnh Đồng Nai,71307,Huyện Vĩnh Cửu,71307093,Xã Phú Lý
28,Tỉnh Đồng Nai,70715,Huyện Bù Gia Mập,70715094,Xã Bù Gia Mập
28,Tỉnh Đồng Nai,70715,Huyện Bù Gia Mập,70715095,Xã Đăk Ơ
29,Tp Hồ Chí Minh,71701,Thành phố Vũng Tàu,71701001,Phường Vũng Tàu
29,Tp Hồ Chí Minh,71701,Thành phố Vũng Tàu,71701002,Phường Tam Thắng
29,Tp Hồ Chí Minh,71701,Thành phố Vũng Tàu,71701003,Phường Rạch Dừa
29,Tp Hồ Chí Minh,71701,Thành phố Vũng Tàu,71701004,Phường Phước Thắng
29,Tp Hồ Chí Minh,71703,Thành phố Bà Rịa,71703005,Phường Bà Rịa
29,Tp Hồ Chí Minh,71703,Thành phố Bà Rịa,71703006,Phường Long Hương
29,Tp Hồ Chí Minh,71709,Thành phố Phú Mỹ,71709007,Phường Phú Mỹ
29,Tp Hồ Chí Minh,71703,Thành phố Bà Rịa,71703008,Phường Tam Long
29,Tp Hồ Chí Minh,71709,Thành phố Phú Mỹ,71709009,Phường Tân Thành
29,Tp Hồ Chí Minh,71709,Thành phố Phú Mỹ,71709010,Phường Tân Phước
29,Tp Hồ Chí Minh,71709,Thành phố Phú Mỹ,71709011,Phường Tân Hải
29,Tp Hồ Chí Minh,71709,Thành phố Phú Mỹ,71709012,Xã Châu Pha
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705013,Xã Ngãi Giao
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705014,Xã Bình Giã
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705015,Xã Kim Long
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705016,Xã Châu Đức
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705017,Xã Xuân Sơn
29,Tp Hồ Chí Minh,71705,Huyện Châu Đức,71705018,Xã Nghĩa Thành
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707019,Xã Hồ Tràm
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707020,Xã Xuyên Mộc
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707021,Xã Hòa Hội
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707022,Xã Bàu Lâm
29,Tp Hồ Chí Minh,71712,Huyện Long Đất,71712023,Xã Phước Hải
29,Tp Hồ Chí Minh,71712,Huyện Long Đất,71712024,Xã Long Hải
29,Tp Hồ Chí Minh,71712,Huyện Long Đất,71712025,Xã Đất Đỏ
29,Tp Hồ Chí Minh,71712,Huyện Long Đất,71712026,Xã Long Điền
29,Tp Hồ Chí Minh,71713,Huyện Côn Đảo,71713027,Đặc khu Côn Đảo
29,Tp Hồ Chí Minh,71109,Thành phố Dĩ An,71109028,Phường Đông Hoà
29,Tp Hồ Chí Minh,71109,Thành phố Dĩ An,71109029,Phường Dĩ An
29,Tp Hồ Chí Minh,71109,Thành phố Dĩ An,71109030,Phường Tân Đông Hiệp
29,Tp Hồ Chí Minh,71107,Thành phố Thuận An,71107031,Phường Thuận An
29,Tp Hồ Chí Minh,71107,Thành phố Thuận An,71107032,Phường Thuận Giao
29,Tp Hồ Chí Minh,71107,Thành phố Thuận An,71107033,Phường Bình Hoà
29,Tp Hồ Chí Minh,71107,Thành phố Thuận An,71107034,Phường Lái Thiêu
29,Tp Hồ Chí Minh,71107,Thành phố Thuận An,71107035,Phường An Phú
29,Tp Hồ Chí Minh,71101,Thành phố Thủ Dầu Một,71101036,Phường Bình Dương
29,Tp Hồ Chí Minh,71101,Thành phố Thủ Dầu Một,71101037,Phường Chánh Hiệp
29,Tp Hồ Chí Minh,71101,Thành phố Thủ Dầu Một,71101038,Phường Thủ Dầu Một
29,Tp Hồ Chí Minh,71101,Thành phố Thủ Dầu Một,71101039,Phường Phú Lợi
29,Tp Hồ Chí Minh,71105,Thành phố Tân Uyên,71105040,Phường Vĩnh Tân
29,Tp Hồ Chí Minh,71105,Thành phố Tân Uyên,71105041,Phường Bình Cơ
29,Tp Hồ Chí Minh,71105,Thành phố Tân Uyên,71105042,Phường Tân Uyên
29,Tp Hồ Chí Minh,71105,Thành phố Tân Uyên,71105043,Phường Tân Hiệp
29,Tp Hồ Chí Minh,71105,Thành phố Tân Uyên,71105044,Phường Tân Khánh
29,Tp Hồ Chí Minh,71103,Thành phố Bến Cát,71103045,Phường Hoà Lợi
29,Tp Hồ Chí Minh,71101,Thành phố Thủ Dầu Một,71101046,Phường Phú An
29,Tp Hồ Chí Minh,71113,Huyện Dầu Tiếng,71113047,Phường Tây Nam
29,Tp Hồ Chí Minh,71115,Huyện Bàu Bàng,71115048,Phường Long Nguyên
29,Tp Hồ Chí Minh,71115,Huyện Bàu Bàng,71115049,Phường Bến Cát
29,Tp Hồ Chí Minh,71115,Huyện Bàu Bàng,71115050,Phường Chánh Phú Hoà
29,Tp Hồ Chí Minh,71117,Huyện Bắc Tân Uyên,71117051,Xã Bắc Tân Uyên
29,Tp Hồ Chí Minh,71117,Huyện Bắc Tân Uyên,71117052,Xã Thường Tân
29,Tp Hồ Chí Minh,71111,Huyện Phú Giáo,71111053,Xã An Long
29,Tp Hồ Chí Minh,71111,Huyện Phú Giáo,71111054,Xã Phước Thành
29,Tp Hồ Chí Minh,71111,Huyện Phú Giáo,71111055,Xã Phước Hoà
29,Tp Hồ Chí Minh,71111,Huyện Phú Giáo,71111056,Xã Phú Giáo
29,Tp Hồ Chí Minh,71115,Huyện Bàu Bàng,71115057,Xã Trừ Văn Thố
29,Tp Hồ Chí Minh,71115,Huyện Bàu Bàng,71115058,Xã Bàu Bàng
29,Tp Hồ Chí Minh,71113,Huyện Dầu Tiếng,71113059,Xã Minh Thạnh
29,Tp Hồ Chí Minh,71113,Huyện Dầu Tiếng,71113060,Xã Long Hoà
29,Tp Hồ Chí Minh,71113,Huyện Dầu Tiếng,71113061,Xã Dầu Tiếng
29,Tp Hồ Chí Minh,71113,Huyện Dầu Tiếng,71113062,Xã Thanh An
29,Tp Hồ Chí Minh,70101,Quận 1,70101063,Phường Sài Gòn
29,Tp Hồ Chí Minh,70101,Quận 1,70101064,Phường Tân Định
29,Tp Hồ Chí Minh,70101,Quận 1,70101065,Phường Bến Thành
29,Tp Hồ Chí Minh,70101,Quận 1,70101066,Phường Cầu Ông Lãnh
29,Tp Hồ Chí Minh,70105,Quận 3,70105067,Phường Bàn Cờ
29,Tp Hồ Chí Minh,70105,Quận 3,70105068,Phường Xuân Hoà
29,Tp Hồ Chí Minh,70105,Quận 3,70105069,Phường Nhiêu Lộc
29,Tp Hồ Chí Minh,70107,Quận 4,70107070,Phường Xóm Chiếu
29,Tp Hồ Chí Minh,70107,Quận 4,70107071,Phường Khánh Hội
29,Tp Hồ Chí Minh,70107,Quận 4,70107072,Phường Vĩnh Hội
29,Tp Hồ Chí Minh,70109,Quận 5,70109073,Phường Chợ Quán
29,Tp Hồ Chí Minh,70109,Quận 5,70109074,Phường An Đông
29,Tp Hồ Chí Minh,70109,Quận 5,70109075,Phường Chợ Lớn
29,Tp Hồ Chí Minh,70111,Quận 6,70111076,Phường Bình Tây
29,Tp Hồ Chí Minh,70111,Quận 6,70111077,Phường Bình Tiên
29,Tp Hồ Chí Minh,70111,Quận 6,70111078,Phường Bình Phú
29,Tp Hồ Chí Minh,70111,Quận 6,70111079,Phường Phú Lâm
29,Tp Hồ Chí Minh,70113,Quận 7,70113080,Phường Tân Thuận
29,Tp Hồ Chí Minh,70113,Quận 7,70113081,Phường Phú Thuận
29,Tp Hồ Chí Minh,70113,Quận 7,70113082,Phường Tân Mỹ
29,Tp Hồ Chí Minh,70113,Quận 7,70113083,Phường Tân Hưng
29,Tp Hồ Chí Minh,70115,Quận 8,70115084,Phường Chánh Hưng
29,Tp Hồ Chí Minh,70115,Quận 8,70115085,Phường Phú Định
29,Tp Hồ Chí Minh,70115,Quận 8,70115086,Phường Bình Đông
29,Tp Hồ Chí Minh,70119,Quận 10,70119087,Phường Diên Hồng
29,Tp Hồ Chí Minh,70119,Quận 10,70119088,Phường Vườn Lài
29,Tp Hồ Chí Minh,70119,Quận 10,70119089,Phường Hoà Hưng
29,Tp Hồ Chí Minh,70121,Quận 11,70121090,Phường Minh Phụng
29,Tp Hồ Chí Minh,70121,Quận 11,70121091,Phường Bình Thới
29,Tp Hồ Chí Minh,70121,Quận 11,70121092,Phường Hoà Bình
29,Tp Hồ Chí Minh,70121,Quận 11,70121093,Phường Phú Thọ
29,Tp Hồ Chí Minh,70123,Quận 12,70123094,Phường Đông Hưng Thuận
29,Tp Hồ Chí Minh,70123,Quận 12,70123095,Phường Trung Mỹ Tây
29,Tp Hồ Chí Minh,70123,Quận 12,70123096,Phường Tân Thới Hiệp
29,Tp Hồ Chí Minh,70123,Quận 12,70123097,Phường Thới An
29,Tp Hồ Chí Minh,70123,Quận 12,70123098,Phường An Phú Đông
29,Tp Hồ Chí Minh,70134,Quận Bình Tân,70134099,Phường An Lạc
29,Tp Hồ Chí Minh,70134,Quận Bình Tân,70134100,Phường Tân Tạo
29,Tp Hồ Chí Minh,70134,Quận Bình Tân,70134101,Phường Bình Tân
29,Tp Hồ Chí Minh,70134,Quận Bình Tân,70134102,Phường Bình Trị Đông
29,Tp Hồ Chí Minh,70134,Quận Bình Tân,70134103,Phường Bình Hưng Hoà
29,Tp Hồ Chí Minh,70129,Quận Bình Thạnh,70129104,Phường Gia Định
29,Tp Hồ Chí Minh,70129,Quận Bình Thạnh,70129105,Phường Bình Thạnh
29,Tp Hồ Chí Minh,70129,Quận Bình Thạnh,70129106,Phường Bình Lợi Trung
29,Tp Hồ Chí Minh,70129,Quận Bình Thạnh,70129107,Phường Thạnh Mỹ Tây
29,Tp Hồ Chí Minh,70129,Quận Bình Thạnh,70129108,Phường Bình Quới
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125109,Phường Hạnh Thông
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125110,Phường An Nhơn
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125111,Phường Gò Vấp
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125112,Phường An Hội Đông
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125113,Phường Thông Tây Hội
29,Tp Hồ Chí Minh,70125,Quận Gò Vấp,70125114,Phường An Hội Tây
29,Tp Hồ Chí Minh,70131,Quận Phú Nhuận,70131115,Phường Đức Nhuận
29,Tp Hồ Chí Minh,70131,Quận Phú Nhuận,70131116,Phường Cầu Kiệu
29,Tp Hồ Chí Minh,70131,Quận Phú Nhuận,70131117,Phường Phú Nhuận
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127118,Phường Tân Sơn Hoà
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127119,Phường Tân Sơn Nhất
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127120,Phường Tân Hoà
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127121,Phường Bảy Hiền
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127122,Phường Tân Bình
29,Tp Hồ Chí Minh,70127,Quận Tân Bình,70127123,Phường Tân Sơn
29,Tp Hồ Chí Minh,70128,Quận Tân Phú,70128124,Phường Tây Thạnh
29,Tp Hồ Chí Minh,70128,Quận Tân Phú,70128125,Phường Tân Sơn Nhì
29,Tp Hồ Chí Minh,70128,Quận Tân Phú,70128126,Phường Phú Thọ Hoà
29,Tp Hồ Chí Minh,70128,Quận Tân Phú,70128127,Phường Tân Phú
29,Tp Hồ Chí Minh,70128,Quận Tân Phú,70128128,Phường Phú Thạnh
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145129,Phường Hiệp Bình
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145130,Phường Thủ Đức
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145131,Phường Tam Bình
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145132,Phường Linh Xuân
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145133,Phường Tăng Nhơn Phú
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145134,Phường Long Bình
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145135,Phường Long Phước
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145136,Phường Long Trường
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145137,Phường Cát Lái
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145138,Phường Bình Trưng
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145139,Phường Phước Long
29,Tp Hồ Chí Minh,70145,Thành phố Thủ Đức,70145140,Phường An Khánh
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139141,Xã Vĩnh Lộc
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139142,Xã Tân Vĩnh Lộc
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139143,Xã Bình Lợi
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139144,Xã Tân Nhựt
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139145,Xã Bình Chánh
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139146,Xã Hưng Long
29,Tp Hồ Chí Minh,70139,Huyện Bình Chánh,70139147,Xã Bình Hưng
29,Tp Hồ Chí Minh,70143,Huyện Cần Giờ,70143148,Xã Bình Khánh
29,Tp Hồ Chí Minh,70143,Huyện Cần Giờ,70143149,Xã An Thới Đông
29,Tp Hồ Chí Minh,70143,Huyện Cần Giờ,70143150,Xã Cần Giờ
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135151,Xã Củ Chi
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135152,Xã Tân An Hội
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135153,Xã Thái Mỹ
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135154,Xã An Nhơn Tây
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135155,Xã Nhuận Đức
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135156,Xã Phú Hoà Đông
29,Tp Hồ Chí Minh,70135,Huyện Củ Chi,70135157,Xã Bình Mỹ
29,Tp Hồ Chí Minh,70137,Huyện Hóc Môn,70137158,Xã Đông Thạnh
29,Tp Hồ Chí Minh,70137,Huyện Hóc Môn,70137159,Xã Hóc Môn
29,Tp Hồ Chí Minh,70137,Huyện Hóc Môn,70137160,Xã Xuân Thới Sơn
29,Tp Hồ Chí Minh,70137,Huyện Hóc Môn,70137161,Xã Bà Điểm
29,Tp Hồ Chí Minh,70141,Huyện Nhà Bè,70141162,Xã Nhà Bè
29,Tp Hồ Chí Minh,70141,Huyện Nhà Bè,70141163,Xã Hiệp Phước
29,Tp Hồ Chí Minh,71701,Thành phố Vũng Tàu,71701164,Xã Long Sơn
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707165,Xã Hòa Hiệp
29,Tp Hồ Chí Minh,71707,Huyện Xuyên Mộc,71707166,Xã Bình Châu
29,Tp Hồ Chí Minh,71103,Thành phố Bến Cát,71103167,Phường Thới Hoà
29,Tp Hồ Chí Minh,70143,Huyện Cần Giờ,70143168,Xã Thạnh An
30,Tỉnh Vĩnh Long,81701,Thành phố Trà Vinh,81701037,Phường Trà Vinh
30,Tỉnh Vĩnh Long,80905,Huyện Mang Thít,80905001,Xã Cái Nhum
30,Tỉnh Vĩnh Long,81701,Thành phố Trà Vinh,81701036,Phường Long Đức
30,Tỉnh Vĩnh Long,80905,Huyện Mang Thít,80905002,Xã Tân Long Hội
30,Tỉnh Vĩnh Long,81701,Thành phố Trà Vinh,81701038,Phường Nguyệt Hóa
30,Tỉnh Vĩnh Long,80905,Huyện Mang Thít,80905003,Xã Nhơn Phú
30,Tỉnh Vĩnh Long,81701,Thành phố Trà Vinh,81701039,Phường Hòa Thuận
30,Tỉnh Vĩnh Long,80905,Huyện Mang Thít,80905004,Xã Bình Phước
30,Tỉnh Vĩnh Long,81703,Huyện Càng Long,81703042,Xã Càng Long
30,Tỉnh Vĩnh Long,80903,Huyện Long Hồ,80903005,Xã An Bình
30,Tỉnh Vĩnh Long,81703,Huyện Càng Long,81703040,Xã An Trường
30,Tỉnh Vĩnh Long,80903,Huyện Long Hồ,80903006,Xã Long Hồ
30,Tỉnh Vĩnh Long,81703,Huyện Càng Long,81703041,Xã Tân An
30,Tỉnh Vĩnh Long,80903,Huyện Long Hồ,80903007,Xã Phú Quới
30,Tỉnh Vĩnh Long,81703,Huyện Càng Long,81703043,Xã Nhị Long
30,Tỉnh Vĩnh Long,80901,Thành phố Vĩnh Long,80901008,Phường Thanh Đức
30,Tỉnh Vĩnh Long,81703,Huyện Càng Long,81703044,Xã Bình Phú
30,Tỉnh Vĩnh Long,80901,Thành phố Vĩnh Long,80901009,Phường Long Châu
30,Tỉnh Vĩnh Long,81705,Huyện Châu Thành,81705046,Xã Châu Thành
30,Tỉnh Vĩnh Long,80901,Thành phố Vĩnh Long,80901010,Phường Phước Hậu
30,Tỉnh Vĩnh Long,81705,Huyện Châu Thành,81705045,Xã Song Lộc
30,Tỉnh Vĩnh Long,80901,Thành phố Vĩnh Long,80901011,Phường Tân Hạnh
30,Tỉnh Vĩnh Long,81705,Huyện Châu Thành,81705047,Xã Hưng Mỹ
30,Tỉnh Vĩnh Long,80901,Thành phố Vĩnh Long,80901012,Phường Tân Ngãi
30,Tỉnh Vĩnh Long,81705,Huyện Châu Thành,81705048,Xã Hòa Minh
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913013,Xã Quới Thiện
30,Tỉnh Vĩnh Long,81705,Huyện Châu Thành,81705049,Xã Long Hòa
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913014,Xã Trung Thành
30,Tỉnh Vĩnh Long,81707,Huyện Cầu Kè,81707050,Xã Cầu Kè
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913015,Xã Trung Ngãi
30,Tỉnh Vĩnh Long,81707,Huyện Cầu Kè,81707051,Xã Phong Thạnh
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913016,Xã Quới An
30,Tỉnh Vĩnh Long,81707,Huyện Cầu Kè,81707052,Xã An Phú Tân
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913017,Xã Trung Hiệp
30,Tỉnh Vĩnh Long,81707,Huyện Cầu Kè,81707053,Xã Tam Ngãi
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913018,Xã Hiếu Phụng
30,Tỉnh Vĩnh Long,81709,Huyện Tiểu Cần,81709056,Xã Tiểu Cần
30,Tỉnh Vĩnh Long,80913,Huyện Vũng Liêm,80913019,Xã Hiếu Thành
30,Tỉnh Vĩnh Long,81709,Huyện Tiểu Cần,81709054,Xã Tân Hòa
30,Tỉnh Vĩnh Long,80911,Huyện Trà Ôn,80911020,Xã Lục Sỹ Thành
30,Tỉnh Vĩnh Long,81709,Huyện Tiểu Cần,81709055,Xã Hùng Hòa
30,Tỉnh Vĩnh Long,80911,Huyện Trà Ôn,80911021,Xã Trà Ôn
30,Tỉnh Vĩnh Long,81709,Huyện Tiểu Cần,81709057,Xã Tập Ngãi
30,Tỉnh Vĩnh Long,80911,Huyện Trà Ôn,80911022,Xã Trà Côn
30,Tỉnh Vĩnh Long,81711,Huyện Cầu Ngang,81711060,Xã Cầu Ngang
30,Tỉnh Vĩnh Long,80911,Huyện Trà Ôn,80911023,Xã Vĩnh Xuân
30,Tỉnh Vĩnh Long,81711,Huyện Cầu Ngang,81711058,Xã Mỹ Long
30,Tỉnh Vĩnh Long,80911,Huyện Trà Ôn,80911024,Xã Hòa Bình
30,Tỉnh Vĩnh Long,81711,Huyện Cầu Ngang,81711059,Xã Vinh Kim
30,Tỉnh Vĩnh Long,80909,Huyện Tam Bình,80909025,Xã Hòa Hiệp
30,Tỉnh Vĩnh Long,81711,Huyện Cầu Ngang,81711061,Xã Nhị Trường
30,Tỉnh Vĩnh Long,80909,Huyện Tam Bình,80909026,Xã Tam Bình
30,Tỉnh Vĩnh Long,81711,Huyện Cầu Ngang,81711062,Xã Hiệp Mỹ
30,Tỉnh Vĩnh Long,80909,Huyện Tam Bình,80909027,Xã Ngãi Tứ
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713066,Xã Trà Cú
30,Tỉnh Vĩnh Long,80909,Huyện Tam Bình,80909028,Xã Song Phú
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713063,Xã Lưu Nghiệp Anh
30,Tỉnh Vĩnh Long,80909,Huyện Tam Bình,80909029,Xã Cái Ngang
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713064,Xã Đại An
30,Tỉnh Vĩnh Long,80908,Huyện Bình Tân,80908030,Xã Tân Quới
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713065,Xã Hàm Giang
30,Tỉnh Vĩnh Long,80908,Huyện Bình Tân,80908031,Xã Tân Lược
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713067,Xã Long Hiệp
30,Tỉnh Vĩnh Long,80908,Huyện Bình Tân,80908032,Xã Mỹ Thuận
30,Tỉnh Vĩnh Long,81713,Huyện Trà Cú,81713068,Xã Tập Sơn
30,Tỉnh Vĩnh Long,80907,Thị xã Bình Minh,80907033,Phường Bình Minh
30,Tỉnh Vĩnh Long,81716,Thị xã Duyên Hải,81716069,Phường Duyên Hải
30,Tỉnh Vĩnh Long,80907,Thị xã Bình Minh,80907034,Phường Cái Vồn
30,Tỉnh Vĩnh Long,81716,Thị xã Duyên Hải,81716070,Phường Trường Long Hòa
30,Tỉnh Vĩnh Long,80907,Thị xã Bình Minh,80907035,Phường Đông Thành
30,Tỉnh Vĩnh Long,81716,Thị xã Duyên Hải,81716071,Xã Long Hữu
30,Tỉnh Vĩnh Long,81715,Huyện Duyên Hải,81715072,Xã Long Thành
30,Tỉnh Vĩnh Long,81715,Huyện Duyên Hải,81715073,Xã Đông Hải
30,Tỉnh Vĩnh Long,81715,Huyện Duyên Hải,81715074,Xã Long Vĩnh
30,Tỉnh Vĩnh Long,81715,Huyện Duyên Hải,81715075,Xã Đôn Châu
30,Tỉnh Vĩnh Long,81715,Huyện Duyên Hải,81715076,Xã Ngũ Lạc
30,Tỉnh Vĩnh Long,81101,Thành phố Bến Tre,81101077,Phường An Hội
30,Tỉnh Vĩnh Long,81101,Thành phố Bến Tre,81101078,Phường Phú Khương
30,Tỉnh Vĩnh Long,81101,Thành phố Bến Tre,81101079,Phường Bến Tre
30,Tỉnh Vĩnh Long,81101,Thành phố Bến Tre,81101080,Phường Sơn Đông
30,Tỉnh Vĩnh Long,81103,Huyện Châu Thành,81103081,Phường Phú Tân
30,Tỉnh Vĩnh Long,81103,Huyện Châu Thành,81103082,Xã Phú Túc
30,Tỉnh Vĩnh Long,81103,Huyện Châu Thành,81103083,Xã Giao Long
30,Tỉnh Vĩnh Long,81103,Huyện Châu Thành,81103084,Xã Tiên Thủy
30,Tỉnh Vĩnh Long,81103,Huyện Châu Thành,81103085,Xã Tân Phú
30,Tỉnh Vĩnh Long,81105,Huyện Chợ Lách,81105086,Xã Phú Phụng
30,Tỉnh Vĩnh Long,81105,Huyện Chợ Lách,81105087,Xã Chợ Lách
30,Tỉnh Vĩnh Long,81105,Huyện Chợ Lách,81105088,Xã Vĩnh Thành
30,Tỉnh Vĩnh Long,81105,Huyện Chợ Lách,81105089,Xã Hưng Khánh Trung
30,Tỉnh Vĩnh Long,81108,Huyện Mỏ Cày Bắc,81108090,Xã Phước Mỹ Trung
30,Tỉnh Vĩnh Long,81108,Huyện Mỏ Cày Bắc,81108091,Xã Tân Thành Bình
30,Tỉnh Vĩnh Long,81108,Huyện Mỏ Cày Bắc,81108092,Xã Nhuận Phú Tân
30,Tỉnh Vĩnh Long,81107,Huyện Mỏ Cày Nam,81107093,Xã Đồng Khởi
30,Tỉnh Vĩnh Long,81107,Huyện Mỏ Cày Nam,81107094,Xã Mỏ Cày
30,Tỉnh Vĩnh Long,81107,Huyện Mỏ Cày Nam,81107095,Xã Thành Thới
30,Tỉnh Vĩnh Long,81107,Huyện Mỏ Cày Nam,81107096,Xã An Định
30,Tỉnh Vĩnh Long,81107,Huyện Mỏ Cày Nam,81107097,Xã Hương Mỹ
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115098,Xã Đại Điền
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115099,Xã Quới Điền
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115100,Xã Thạnh Phú
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115101,Xã An Qui
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115102,Xã Thạnh Hải
30,Tỉnh Vĩnh Long,81115,Huyện Thạnh Phú,81115103,Xã Thạnh Phong
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113104,Xã Tân Thủy
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113105,Xã Bảo Thạnh
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113106,Xã Ba Tri
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113107,Xã Tân Xuân
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113108,Xã Mỹ Chánh Hòa
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113109,Xã An Ngãi Trung
30,Tỉnh Vĩnh Long,81113,Huyện Ba Tri,81113110,Xã An Hiệp
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109111,Xã Hưng Nhượng
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109112,Xã Giồng Trôm
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109113,Xã Tân Hào
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109114,Xã Phước Long
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109115,Xã Lương Phú
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109116,Xã Châu Hòa
30,Tỉnh Vĩnh Long,81109,Huyện Giồng Trôm,81109117,Xã Lương Hòa
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111118,Xã Thới Thuận
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111119,Xã Thạnh Phước
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111120,Xã Bình Đại
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111121,Xã Thạnh Trị
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111122,Xã Lộc Thuận
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111123,Xã Châu Hưng
30,Tỉnh Vĩnh Long,81111,Huyện Bình Đại,81111124,Xã Phú Thuận
31,Tỉnh Đồng Tháp,80701,Thành phố Mỹ Tho,80701001,Phường Mỹ Tho
31,Tỉnh Đồng Tháp,80701,Thành phố Mỹ Tho,80701002,Phường Đạo Thạnh
31,Tỉnh Đồng Tháp,80701,Thành phố Mỹ Tho,80701003,Phường Mỹ Phong
31,Tỉnh Đồng Tháp,80701,Thành phố Mỹ Tho,80701004,Phường Thới Sơn
31,Tỉnh Đồng Tháp,80701,Thành phố Mỹ Tho,80701005,Phường Trung An
31,Tỉnh Đồng Tháp,80703,Thành phố Gò Công,80703006,Phường Gò Công
31,Tỉnh Đồng Tháp,80703,Thành phố Gò Công,80703007,Phường Long Thuận
31,Tỉnh Đồng Tháp,80703,Thành phố Gò Công,80703008,Phường Sơn Qui
31,Tỉnh Đồng Tháp,80703,Thành phố Gò Công,80703009,Phường Bình Xuân
31,Tỉnh Đồng Tháp,80721,Thị xã Cai Lậy,80721010,Phường Mỹ Phước Tây
31,Tỉnh Đồng Tháp,80721,Thị xã Cai Lậy,80721011,Phường Thanh Hoà
31,Tỉnh Đồng Tháp,80721,Thị xã Cai Lậy,80721012,Phường Cai Lậy
31,Tỉnh Đồng Tháp,80721,Thị xã Cai Lậy,80721013,Phường Nhị Quý
31,Tỉnh Đồng Tháp,80721,Thị xã Cai Lậy,80721014,Xã Tân Phú
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713015,Xã Thanh Hưng
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713016,Xã An Hữu
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713017,Xã Mỹ Lợi
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713018,Xã Mỹ Đức Tây
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713019,Xã Mỹ Thiện
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713020,Xã Hậu Mỹ
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713021,Xã Hội Cư
31,Tỉnh Đồng Tháp,80713,Huyện Cái Bè,80713022,Xã Cái Bè
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709023,Xã Bình Phú
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709024,Xã Hiệp Đức
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709025,Xã Ngũ Hiệp
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709026,Xã Long Tiên
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709027,Xã Mỹ Thành
31,Tỉnh Đồng Tháp,80709,Huyện Cai Lậy,80709028,Xã Thạnh Phú
31,Tỉnh Đồng Tháp,80705,Huyện Tân Phước,80705029,Xã Tân Phước 1
31,Tỉnh Đồng Tháp,80705,Huyện Tân Phước,80705030,Xã Tân Phước 2
31,Tỉnh Đồng Tháp,80705,Huyện Tân Phước,80705031,Xã Tân Phước 3
31,Tỉnh Đồng Tháp,80705,Huyện Tân Phước,80705032,Xã Hưng Thạnh
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707033,Xã Tân Hương
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707034,Xã Châu Thành
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707035,Xã Long Hưng
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707036,Xã Long Định
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707037,Xã Vĩnh Kim
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707038,Xã Kim Sơn
31,Tỉnh Đồng Tháp,80707,Huyện Châu Thành,80707039,Xã Bình Trưng
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711040,Xã Mỹ Tịnh An
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711041,Xã Lương Hoà Lạc
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711042,Xã Tân Thuận Bình
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711043,Xã Chợ Gạo
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711044,Xã An Thạnh Thủy
31,Tỉnh Đồng Tháp,80711,Huyện Chợ Gạo,80711045,Xã Bình Ninh
31,Tỉnh Đồng Tháp,80715,Huyện Gò Công Tây,80715046,Xã Vĩnh Bình
31,Tỉnh Đồng Tháp,80715,Huyện Gò Công Tây,80715047,Xã Đồng Sơn
31,Tỉnh Đồng Tháp,80715,Huyện Gò Công Tây,80715048,Xã Phú Thành
31,Tỉnh Đồng Tháp,80715,Huyện Gò Công Tây,80715049,Xã Long Bình
31,Tỉnh Đồng Tháp,80715,Huyện Gò Công Tây,80715050,Xã Vĩnh Hựu
31,Tỉnh Đồng Tháp,80717,Huyện Gò Công Đông,80717051,Xã Gò Công Đông
31,Tỉnh Đồng Tháp,80717,Huyện Gò Công Đông,80717052,Xã Tân Điền
31,Tỉnh Đồng Tháp,80717,Huyện Gò Công Đông,80717053,Xã Tân Hoà
31,Tỉnh Đồng Tháp,80717,Huyện Gò Công Đông,80717054,Xã Tân Đông
31,Tỉnh Đồng Tháp,80717,Huyện Gò Công Đông,80717055,Xã Gia Thuận
31,Tỉnh Đồng Tháp,80719,Huyện Tân Phú Đông,80719056,Xã Tân Thới
31,Tỉnh Đồng Tháp,80719,Huyện Tân Phú Đông,80719057,Xã Tân Phú Đông
31,Tỉnh Đồng Tháp,80305,Huyện Tân Hồng,80305058,Xã Tân Hồng
31,Tỉnh Đồng Tháp,80305,Huyện Tân Hồng,80305059,Xã Tân Thành
31,Tỉnh Đồng Tháp,80305,Huyện Tân Hồng,80305060,Xã Tân Hộ Cơ
31,Tỉnh Đồng Tháp,80305,Huyện Tân Hồng,80305061,Xã An Phước
31,Tỉnh Đồng Tháp,80323,Thành phố Hồng Ngự,80323062,Phường An Bình
31,Tỉnh Đồng Tháp,80323,Thành phố Hồng Ngự,80323063,Phường Hồng Ngự
31,Tỉnh Đồng Tháp,80307,Huyện Hồng Ngự,80307064,Phường Thường Lạc
31,Tỉnh Đồng Tháp,80307,Huyện Hồng Ngự,80307065,Xã Thường Phước
31,Tỉnh Đồng Tháp,80307,Huyện Hồng Ngự,80307066,Xã Long Khánh
31,Tỉnh Đồng Tháp,80307,Huyện Hồng Ngự,80307067,Xã Long Phú Thuận
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309068,Xã An Hoà
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309069,Xã Tam Nông
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309070,Xã Phú Thọ
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309071,Xã Tràm Chim
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309072,Xã Phú Cường
31,Tỉnh Đồng Tháp,80309,Huyện Tam Nông,80309073,Xã An Long
31,Tỉnh Đồng Tháp,80311,Huyện Thanh Bình,80311074,Xã Thanh Bình
31,Tỉnh Đồng Tháp,80311,Huyện Thanh Bình,80311075,Xã Tân Thạnh
31,Tỉnh Đồng Tháp,80311,Huyện Thanh Bình,80311076,Xã Bình Thành
31,Tỉnh Đồng Tháp,80311,Huyện Thanh Bình,80311077,Xã Tân Long
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313078,Xã Tháp Mười
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313079,Xã Thanh Mỹ
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313080,Xã Mỹ Quí
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313081,Xã Đốc Binh Kiều
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313082,Xã Trường Xuân
31,Tỉnh Đồng Tháp,80313,Huyện Tháp Mười,80313083,Xã Phương Thịnh
31,Tỉnh Đồng Tháp,80315,Huyện Cao Lãnh,80315084,Xã Phong Mỹ
31,Tỉnh Đồng Tháp,80315,Huyện Cao Lãnh,80315085,Xã Ba Sao
31,Tỉnh Đồng Tháp,80315,Huyện Cao Lãnh,80315086,Xã Mỹ Thọ
31,Tỉnh Đồng Tháp,80315,Huyện Cao Lãnh,80315087,Xã Bình Hàng Trung
31,Tỉnh Đồng Tháp,80315,Huyện Cao Lãnh,80315088,Xã Mỹ Hiệp
31,Tỉnh Đồng Tháp,80301,Thành phố Cao Lãnh,80301089,Phường Cao Lãnh
31,Tỉnh Đồng Tháp,80301,Thành phố Cao Lãnh,80301090,Phường Mỹ Ngãi
31,Tỉnh Đồng Tháp,80301,Thành phố Cao Lãnh,80301091,Phường Mỹ Trà
31,Tỉnh Đồng Tháp,80317,Huyện Lấp Vò,80317092,Xã Mỹ An Hưng
31,Tỉnh Đồng Tháp,80317,Huyện Lấp Vò,80317093,Xã Tân Khánh Trung
31,Tỉnh Đồng Tháp,80317,Huyện Lấp Vò,80317094,Xã Lấp Vò
31,Tỉnh Đồng Tháp,80319,Huyện Lai Vung,80319095,Xã Lai Vung
31,Tỉnh Đồng Tháp,80319,Huyện Lai Vung,80319096,Xã Hoà Long
31,Tỉnh Đồng Tháp,80319,Huyện Lai Vung,80319097,Xã Phong Hoà
31,Tỉnh Đồng Tháp,80303,Thành phố Sa Đéc,80303098,Phường Sa Đéc
31,Tỉnh Đồng Tháp,80319,Huyện Lai Vung,80319099,Xã Tân Dương
31,Tỉnh Đồng Tháp,80321,Huyện Châu Thành,80321100,Xã Phú Hựu
31,Tỉnh Đồng Tháp,80321,Huyện Châu Thành,80321101,Xã Tân Nhuận Đông
31,Tỉnh Đồng Tháp,80321,Huyện Châu Thành,80321102,Xã Tân Phú Trung
32,Tỉnh An Giang,80501,Thành phố Long Xuyên,80501001,Xã Mỹ Hoà Hưng
32,Tỉnh An Giang,80501,Thành phố Long Xuyên,80501002,Phường Long Xuyên
32,Tỉnh An Giang,80501,Thành phố Long Xuyên,80501003,Phường Bình Đức
32,Tỉnh An Giang,80501,Thành phố Long Xuyên,80501004,Phường Mỹ Thới
32,Tỉnh An Giang,80503,Thành phố Châu Đốc,80503005,Phường Châu Đốc
32,Tỉnh An Giang,80503,Thành phố Châu Đốc,80503006,Phường Vĩnh Tế
32,Tỉnh An Giang,80505,Huyện An Phú,80505007,Xã An Phú
32,Tỉnh An Giang,80505,Huyện An Phú,80505008,Xã Vĩnh Hậu
32,Tỉnh An Giang,80505,Huyện An Phú,80505009,Xã Nhơn Hội
32,Tỉnh An Giang,80505,Huyện An Phú,80505010,Xã Khánh Bình
32,Tỉnh An Giang,80505,Huyện An Phú,80505011,Xã Phú Hữu
32,Tỉnh An Giang,80507,Thị xã Tân Châu,80507012,Xã Tân An
32,Tỉnh An Giang,80507,Thị xã Tân Châu,80507013,Xã Châu Phong
32,Tỉnh An Giang,80507,Thị xã Tân Châu,80507014,Xã Vĩnh Xương
32,Tỉnh An Giang,80507,Thị xã Tân Châu,80507015,Phường Tân Châu
32,Tỉnh An Giang,80507,Thị xã Tân Châu,80507016,Phường Long Phú
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509017,Xã Phú Tân
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509018,Xã Phú An
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509019,Xã Bình Thạnh Đông
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509020,Xã Chợ Vàm
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509021,Xã Hoà Lạc
32,Tỉnh An Giang,80509,Huyện Phú Tân,80509022,Xã Phú Lâm
32,Tỉnh An Giang,80511,Huyện Châu Phú,80511023,Xã Châu Phú
32,Tỉnh An Giang,80511,Huyện Châu Phú,80511024,Xã Mỹ Đức
32,Tỉnh An Giang,80511,Huyện Châu Phú,80511025,Xã Vĩnh Thạnh Trung
32,Tỉnh An Giang,80511,Huyện Châu Phú,80511026,Xã Bình Mỹ
32,Tỉnh An Giang,80511,Huyện Châu Phú,80511027,Xã Thạnh Mỹ Tây
32,Tỉnh An Giang,80513,Thị xã Tịnh Biên,80513028,Xã An Cư
32,Tỉnh An Giang,80513,Thị xã Tịnh Biên,80513029,Xã Núi Cấm
32,Tỉnh An Giang,80513,Thị xã Tịnh Biên,80513030,Phường Tịnh Biên
32,Tỉnh An Giang,80513,Thị xã Tịnh Biên,80513031,Phường Thới Sơn
32,Tỉnh An Giang,80513,Thị xã Tịnh Biên,80513032,Phường Chi Lăng
32,Tỉnh An Giang,80515,Huyện Tri Tôn,80515033,Xã Ba Chúc
32,Tỉnh An Giang,80515,Huyện Tri Tôn,80515034,Xã Tri Tôn
32,Tỉnh An Giang,80515,Huyện Tri Tôn,80515035,Xã Ô Lâm
32,Tỉnh An Giang,80515,Huyện Tri Tôn,80515036,Xã Cô Tô
32,Tỉnh An Giang,80515,Huyện Tri Tôn,80515037,Xã Vĩnh Gia
32,Tỉnh An Giang,80519,Huyện Châu Thành,80519038,Xã An Châu
32,Tỉnh An Giang,80519,Huyện Châu Thành,80519039,Xã Bình Hoà
32,Tỉnh An Giang,80519,Huyện Châu Thành,80519040,Xã Cần Đăng
32,Tỉnh An Giang,80519,Huyện Châu Thành,80519041,Xã Vĩnh Hanh
32,Tỉnh An Giang,80519,Huyện Châu Thành,80519042,Xã Vĩnh An
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517043,Xã Chợ Mới
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517044,Xã Cù Lao Giêng
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517045,Xã Hội An
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517046,Xã Long Điền
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517047,Xã Nhơn Mỹ
32,Tỉnh An Giang,80517,Huyện Chợ Mới,80517048,Xã Long Kiến
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521049,Xã Thoại Sơn
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521050,Xã Óc Eo
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521051,Xã Định Mỹ
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521052,Xã Phú Hoà
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521053,Xã Vĩnh Trạch
32,Tỉnh An Giang,80521,Huyện Thoại Sơn,80521054,Xã Tây Phú
32,Tỉnh An Giang,81319,Huyện Vĩnh Thuận,81319055,Xã Vĩnh Bình
32,Tỉnh An Giang,81319,Huyện Vĩnh Thuận,81319056,Xã Vĩnh Thuận
32,Tỉnh An Giang,81319,Huyện Vĩnh Thuận,81319057,Xã Vĩnh Phong
32,Tỉnh An Giang,81327,Huyện U Minh Thượng,81327058,Xã Vĩnh Hoà
32,Tỉnh An Giang,81327,Huyện U Minh Thượng,81327059,Xã U Minh Thượng
32,Tỉnh An Giang,81317,Huyện An Minh,81317060,Xã Đông Hoà
32,Tỉnh An Giang,81317,Huyện An Minh,81317061,Xã Tân Thạnh
32,Tỉnh An Giang,81317,Huyện An Minh,81317062,Xã Đông Hưng
32,Tỉnh An Giang,81317,Huyện An Minh,81317063,Xã An Minh
32,Tỉnh An Giang,81317,Huyện An Minh,81317064,Xã Vân Khánh
32,Tỉnh An Giang,81315,Huyện An Biên,81315065,Xã Tây Yên
32,Tỉnh An Giang,81315,Huyện An Biên,81315066,Xã Đông Thái
32,Tỉnh An Giang,81315,Huyện An Biên,81315067,Xã An Biên
32,Tỉnh An Giang,81313,Huyện Gò Quao,81313068,Xã Định Hoà
32,Tỉnh An Giang,81313,Huyện Gò Quao,81313069,Xã Gò Quao
32,Tỉnh An Giang,81313,Huyện Gò Quao,81313070,Xã Vĩnh Hoà Hưng
32,Tỉnh An Giang,81313,Huyện Gò Quao,81313071,Xã Vĩnh Tuy
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311072,Xã Giồng Riềng
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311073,Xã Thạnh Hưng
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311074,Xã Long Thạnh
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311075,Xã Hoà Hưng
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311076,Xã Ngọc Chúc
32,Tỉnh An Giang,81311,Huyện Giồng Riềng,81311077,Xã Hoà Thuận
32,Tỉnh An Giang,81307,Huyện Tân Hiệp,81307078,Xã Tân Hội
32,Tỉnh An Giang,81307,Huyện Tân Hiệp,81307079,Xã Tân Hiệp
32,Tỉnh An Giang,81307,Huyện Tân Hiệp,81307080,Xã Thạnh Đông
32,Tỉnh An Giang,81309,Huyện Châu Thành,81309081,Xã Thạnh Lộc
32,Tỉnh An Giang,81309,Huyện Châu Thành,81309082,Xã Châu Thành
32,Tỉnh An Giang,81309,Huyện Châu Thành,81309083,Xã Bình An
32,Tỉnh An Giang,81305,Huyện Hòn Đất,81305084,Xã Hòn Đất
32,Tỉnh An Giang,81305,Huyện Hòn Đất,81305085,Xã Sơn Kiên
32,Tỉnh An Giang,81305,Huyện Hòn Đất,81305086,Xã Mỹ Thuận
32,Tỉnh An Giang,81305,Huyện Hòn Đất,81305087,Xã Bình Sơn
32,Tỉnh An Giang,81305,Huyện Hòn Đất,81305088,Xã Bình Giang
32,Tỉnh An Giang,81304,Huyện Giang Thành,81304089,Xã Giang Thành
32,Tỉnh An Giang,81304,Huyện Giang Thành,81304090,Xã Vĩnh Điều
32,Tỉnh An Giang,81303,Huyện Kiên Lương,81303091,Xã Hoà Điền
32,Tỉnh An Giang,81303,Huyện Kiên Lương,81303092,Xã Kiên Lương
32,Tỉnh An Giang,81303,Huyện Kiên Lương,81303093,Xã Sơn Hải
32,Tỉnh An Giang,81303,Huyện Kiên Lương,81303094,Xã Hòn Nghệ
32,Tỉnh An Giang,81323,Huyện Kiên Hải,81323095,Đặc khu Kiên Hải
32,Tỉnh An Giang,81301,Thành phố Rạch Giá,81301096,Phường Vĩnh Thông
32,Tỉnh An Giang,81301,Thành phố Rạch Giá,81301097,Phường Rạch Giá
32,Tỉnh An Giang,81325,Thành phố Hà Tiên,81325098,Phường Hà Tiên
32,Tỉnh An Giang,81325,Thành phố Hà Tiên,81325099,Phường Tô Châu
32,Tỉnh An Giang,81325,Thành phố Hà Tiên,81325100,Xã Tiên Hải
32,Tỉnh An Giang,81321,Thành phố Phú Quốc,81321101,Đặc khu Phú Quốc
32,Tỉnh An Giang,81321,Thành phố Phú Quốc,81321102,Đặc khu Thổ Châu
33,Tp Cần Thơ,81519,Quận Ninh Kiều,81519001,Phường Ninh Kiều
33,Tp Cần Thơ,81519,Quận Ninh Kiều,81519002,Phường Cái Khế
33,Tp Cần Thơ,81519,Quận Ninh Kiều,81519003,Phường Tân An
33,Tp Cần Thơ,81519,Quận Ninh Kiều,81519004,Phường An Bình
33,Tp Cần Thơ,81521,Quận Bình Thuỷ,81521005,Phường Thới An Đông
33,Tp Cần Thơ,81521,Quận Bình Thuỷ,81521006,Phường Bình Thủy
33,Tp Cần Thơ,81521,Quận Bình Thuỷ,81521007,Phường Long Tuyền
33,Tp Cần Thơ,81523,Quận Cái Răng,81523008,Phường Cái Răng
33,Tp Cần Thơ,81523,Quận Cái Răng,81523009,Phường Hưng Phú
33,Tp Cần Thơ,81505,Quận Ô Môn,81505010,Phường Ô Môn
33,Tp Cần Thơ,81505,Quận Ô Môn,81505011,Phường Thới Long
33,Tp Cần Thơ,81505,Quận Ô Môn,81505012,Phường Phước Thới
33,Tp Cần Thơ,81503,Quận Thốt Nốt,81503013,Phường Trung Nhứt
33,Tp Cần Thơ,81503,Quận Thốt Nốt,81503014,Phường Thốt Nốt
33,Tp Cần Thơ,81503,Quận Thốt Nốt,81503015,Phường Thuận Hưng
33,Tp Cần Thơ,81503,Quận Thốt Nốt,81503016,Phường Tân Lộc
33,Tp Cần Thơ,81529,Huyện Phong Điền,81529017,Xã Phong Điền
33,Tp Cần Thơ,81529,Huyện Phong Điền,81529018,Xã Nhơn Ái
33,Tp Cần Thơ,81529,Huyện Phong Điền,81529019,Xã Trường Long
33,Tp Cần Thơ,81531,Huyện Thới Lai,81531020,Xã Thới Lai
33,Tp Cần Thơ,81531,Huyện Thới Lai,81531021,Xã Đông Thuận
33,Tp Cần Thơ,81531,Huyện Thới Lai,81531022,Xã Trường Xuân
33,Tp Cần Thơ,81531,Huyện Thới Lai,81531023,Xã Trường Thành
33,Tp Cần Thơ,81527,Huyện Cờ Đỏ,81527024,Xã Cờ Đỏ
33,Tp Cần Thơ,81527,Huyện Cờ Đỏ,81527025,Xã Đông Hiệp
33,Tp Cần Thơ,81527,Huyện Cờ Đỏ,81527026,Xã Thạnh Phú
33,Tp Cần Thơ,81527,Huyện Cờ Đỏ,81527027,Xã Thới Hưng
33,Tp Cần Thơ,81527,Huyện Cờ Đỏ,81527028,Xã Trung Hưng
33,Tp Cần Thơ,81525,Huyện Vĩnh Thạnh,81525029,Xã Vĩnh Thạnh
33,Tp Cần Thơ,81525,Huyện Vĩnh Thạnh,81525030,Xã Vĩnh Trinh
33,Tp Cần Thơ,81525,Huyện Vĩnh Thạnh,81525031,Xã Thạnh An
33,Tp Cần Thơ,81525,Huyện Vĩnh Thạnh,81525032,Xã Thạnh Quới
33,Tp Cần Thơ,81601,Thành phố Vị Thanh,81601033,Xã Hỏa Lựu
33,Tp Cần Thơ,81601,Thành phố Vị Thanh,81601034,Phường Vị Thanh
33,Tp Cần Thơ,81601,Thành phố Vị Thanh,81601035,Phường Vị Tân
33,Tp Cần Thơ,81609,Huyện Vị Thủy,81609036,Xã Vị Thủy
33,Tp Cần Thơ,81609,Huyện Vị Thủy,81609037,Xã Vĩnh Thuận Đông
33,Tp Cần Thơ,81609,Huyện Vị Thủy,81609038,Xã Vị Thanh 1
33,Tp Cần Thơ,81609,Huyện Vị Thủy,81609039,Xã Vĩnh Tường
33,Tp Cần Thơ,81611,Huyện Long Mỹ,81611040,Xã Vĩnh Viễn
33,Tp Cần Thơ,81611,Huyện Long Mỹ,81611041,Xã Xà Phiên
33,Tp Cần Thơ,81611,Huyện Long Mỹ,81611042,Xã Lương Tâm
33,Tp Cần Thơ,81612,Thị xã Long Mỹ,81612043,Phường Long Bình
33,Tp Cần Thơ,81612,Thị xã Long Mỹ,81612044,Phường Long Mỹ
33,Tp Cần Thơ,81612,Thị xã Long Mỹ,81612045,Phường Long Phú 1
33,Tp Cần Thơ,81603,Huyện Châu Thành A,81603046,Xã Thạnh Xuân
33,Tp Cần Thơ,81603,Huyện Châu Thành A,81603047,Xã Tân Hoà
33,Tp Cần Thơ,81603,Huyện Châu Thành A,81603048,Xã Trường Long Tây
33,Tp Cần Thơ,81605,Huyện Châu Thành,81605049,Xã Châu Thành
33,Tp Cần Thơ,81605,Huyện Châu Thành,81605050,Xã Đông Phước
33,Tp Cần Thơ,81605,Huyện Châu Thành,81605051,Xã Phú Hữu
33,Tp Cần Thơ,81607,Thành phố Ngã Bảy,81607052,Phường Đại Thành
33,Tp Cần Thơ,81607,Thành phố Ngã Bảy,81607053,Phường Ngã Bảy
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608054,Xã Tân Bình
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608055,Xã Hoà An
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608056,Xã Phương Bình
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608057,Xã Tân Phước Hưng
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608058,Xã Hiệp Hưng
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608059,Xã Phụng Hiệp
33,Tp Cần Thơ,81608,Huyện Phụng Hiệp,81608060,Xã Thạnh Hoà
33,Tp Cần Thơ,81901,Thành phố Sóc Trăng,81901061,Phường Phú Lợi
33,Tp Cần Thơ,81901,Thành phố Sóc Trăng,81901062,Phường Sóc Trăng
33,Tp Cần Thơ,81901,Thành phố Sóc Trăng,81901063,Phường Mỹ Xuyên
33,Tp Cần Thơ,81909,Huyện Mỹ Xuyên,81909064,Xã Hoà Tú
33,Tp Cần Thơ,81909,Huyện Mỹ Xuyên,81909065,Xã Gia Hoà
33,Tp Cần Thơ,81909,Huyện Mỹ Xuyên,81909066,Xã Nhu Gia
33,Tp Cần Thơ,81909,Huyện Mỹ Xuyên,81909067,Xã Ngọc Tố
33,Tp Cần Thơ,81905,Huyện Long Phú,81905068,Xã Trường Khánh
33,Tp Cần Thơ,81905,Huyện Long Phú,81905069,Xã Đại Ngãi
33,Tp Cần Thơ,81905,Huyện Long Phú,81905070,Xã Tân Thạnh
33,Tp Cần Thơ,81905,Huyện Long Phú,81905071,Xã Long Phú
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903072,Xã Nhơn Mỹ
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903073,Xã Phong Nẫm
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903074,Xã An Lạc Thôn
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903075,Xã Kế Sách
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903076,Xã Thới An Hội
33,Tp Cần Thơ,81903,Huyện Kế Sách,81903077,Xã Đại Hải
33,Tp Cần Thơ,81915,Huyện Châu Thành,81915078,Xã Phú Tâm
33,Tp Cần Thơ,81915,Huyện Châu Thành,81915079,Xã An Ninh
33,Tp Cần Thơ,81915,Huyện Châu Thành,81915080,Xã Thuận Hoà
33,Tp Cần Thơ,81915,Huyện Châu Thành,81915081,Xã Hồ Đắc Kiện
33,Tp Cần Thơ,81907,Huyện Mỹ Tú,81907082,Xã Mỹ Tú
33,Tp Cần Thơ,81907,Huyện Mỹ Tú,81907083,Xã Long Hưng
33,Tp Cần Thơ,81907,Huyện Mỹ Tú,81907084,Xã Mỹ Phước
33,Tp Cần Thơ,81907,Huyện Mỹ Tú,81907085,Xã Mỹ Hương
33,Tp Cần Thơ,81913,Thị xã Vĩnh Châu,81913086,Xã Vĩnh Hải
33,Tp Cần Thơ,81913,Thị xã Vĩnh Châu,81913087,Xã Lai Hoà
33,Tp Cần Thơ,81913,Thị xã Vĩnh Châu,81913088,Phường Vĩnh Phước
33,Tp Cần Thơ,81913,Thị xã Vĩnh Châu,81913089,Phường Vĩnh Châu
33,Tp Cần Thơ,81913,Thị xã Vĩnh Châu,81913090,Phường Khánh Hoà
33,Tp Cần Thơ,81912,Thị xã Ngã Năm,81912091,Xã Tân Long
33,Tp Cần Thơ,81912,Thị xã Ngã Năm,81912092,Phường Ngã Năm
33,Tp Cần Thơ,81912,Thị xã Ngã Năm,81912093,Phường Mỹ Quới
33,Tp Cần Thơ,81911,Huyện Thạnh Trị,81911094,Xã Phú Lộc
33,Tp Cần Thơ,81911,Huyện Thạnh Trị,81911095,Xã Vĩnh Lợi
33,Tp Cần Thơ,81911,Huyện Thạnh Trị,81911096,Xã Lâm Tân
33,Tp Cần Thơ,81917,Huyện Trần Đề,81917097,Xã Thạnh Thới An
33,Tp Cần Thơ,81917,Huyện Trần Đề,81917098,Xã Tài Văn
33,Tp Cần Thơ,81917,Huyện Trần Đề,81917099,Xã Liêu Tú
33,Tp Cần Thơ,81917,Huyện Trần Đề,81917100,Xã Lịch Hội Thượng
33,Tp Cần Thơ,81917,Huyện Trần Đề,81917101,Xã Trần Đề
33,Tp Cần Thơ,81906,Huyện Cù Lao Dung,81906102,Xã An Thạnh
33,Tp Cần Thơ,81906,Huyện Cù Lao Dung,81906103,Xã Cù Lao Dung
34,Tỉnh Cà Mau,82301,Thành phố Cà Mau,82301001,Phường An Xuyên
34,Tỉnh Cà Mau,82301,Thành phố Cà Mau,82301002,Phường Lý Văn Lâm
34,Tỉnh Cà Mau,82301,Thành phố Cà Mau,82301003,Phường Tân Thành
34,Tỉnh Cà Mau,82301,Thành phố Cà Mau,82301004,Phường Hòa Thành
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311005,Xã Tân Thuận
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311006,Xã Tân Tiến
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311007,Xã Tạ An Khương
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311008,Xã Trần Phán
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311009,Xã Thanh Tùng
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311010,Xã Đầm Dơi
34,Tỉnh Cà Mau,82311,Huyện Đầm Dơi,82311011,Xã Quách Phẩm
34,Tỉnh Cà Mau,82305,Huyện U Minh,82305012,Xã U Minh
34,Tỉnh Cà Mau,82305,Huyện U Minh,82305013,Xã Nguyễn Phích
34,Tỉnh Cà Mau,82305,Huyện U Minh,82305014,Xã Khánh Lâm
34,Tỉnh Cà Mau,82305,Huyện U Minh,82305015,Xã Khánh An
34,Tỉnh Cà Mau,82313,Huyện Ngọc Hiển,82313016,Xã Phan Ngọc Hiển
34,Tỉnh Cà Mau,82313,Huyện Ngọc Hiển,82313017,Xã Đất Mũi
34,Tỉnh Cà Mau,82313,Huyện Ngọc Hiển,82313018,Xã Tân Ân
34,Tỉnh Cà Mau,82307,Huyện Trần Văn Thời,82307019,Xã Khánh Bình
34,Tỉnh Cà Mau,82307,Huyện Trần Văn Thời,82307020,Xã Đá Bạc
34,Tỉnh Cà Mau,82307,Huyện Trần Văn Thời,82307021,Xã Khánh Hưng
34,Tỉnh Cà Mau,82307,Huyện Trần Văn Thời,82307022,Xã Sông Đốc
34,Tỉnh Cà Mau,82307,Huyện Trần Văn Thời,82307023,Xã Trần Văn Thời
34,Tỉnh Cà Mau,82303,Huyện Thới Bình,82303024,Xã Thới Bình
34,Tỉnh Cà Mau,82303,Huyện Thới Bình,82303025,Xã Trí Phải
34,Tỉnh Cà Mau,82303,Huyện Thới Bình,82303026,Xã Tân Lộc
34,Tỉnh Cà Mau,82303,Huyện Thới Bình,82303027,Xã Hồ Thị Kỷ
34,Tỉnh Cà Mau,82303,Huyện Thới Bình,82303028,Xã Biển Bạch
34,Tỉnh Cà Mau,82312,Huyện Năm Căn,82312029,Xã Đất Mới
34,Tỉnh Cà Mau,82312,Huyện Năm Căn,82312030,Xã Năm Căn
34,Tỉnh Cà Mau,82312,Huyện Năm Căn,82312031,Xã Tam Giang
34,Tỉnh Cà Mau,82308,Huyện Phú Tân,82308032,Xã Cái Đôi Vàm
34,Tỉnh Cà Mau,82308,Huyện Phú Tân,82308033,Xã Nguyễn Việt Khái
34,Tỉnh Cà Mau,82308,Huyện Phú Tân,82308034,Xã Phú Tân
34,Tỉnh Cà Mau,82308,Huyện Phú Tân,82308035,Xã Phú Mỹ
34,Tỉnh Cà Mau,82309,Huyện Cái Nước,82309036,Xã Lương Thế Trân
34,Tỉnh Cà Mau,82309,Huyện Cái Nước,82309037,Xã Tân Hưng
34,Tỉnh Cà Mau,82309,Huyện Cái Nước,82309038,Xã Hưng Mỹ
34,Tỉnh Cà Mau,82309,Huyện Cái Nước,82309039,Xã Cái Nước
34,Tỉnh Cà Mau,82101,Thành phố Bạc Liêu,82101040,Phường Bạc Liêu
34,Tỉnh Cà Mau,82101,Thành phố Bạc Liêu,82101041,Phường Vĩnh Trạch
34,Tỉnh Cà Mau,82101,Thành phố Bạc Liêu,82101042,Phường Hiệp Thành
34,Tỉnh Cà Mau,82107,Thị xã Giá Rai,82107043,Phường Giá Rai
34,Tỉnh Cà Mau,82107,Thị xã Giá Rai,82107044,Phường Láng Tròn
34,Tỉnh Cà Mau,82107,Thị xã Giá Rai,82107045,Xã Phong Thạnh
34,Tỉnh Cà Mau,82103,Huyện Hồng Dân,82103046,Xã Hồng Dân
34,Tỉnh Cà Mau,82103,Huyện Hồng Dân,82103047,Xã Vĩnh Lộc
34,Tỉnh Cà Mau,82103,Huyện Hồng Dân,82103048,Xã Ninh Thạnh Lợi
34,Tỉnh Cà Mau,82103,Huyện Hồng Dân,82103049,Xã Ninh Quới
34,Tỉnh Cà Mau,82111,Huyện Đông Hải,82111050,Xã Gành Hào
34,Tỉnh Cà Mau,82111,Huyện Đông Hải,82111051,Xã Định Thành
34,Tỉnh Cà Mau,82111,Huyện Đông Hải,82111052,Xã An Trạch
34,Tỉnh Cà Mau,82111,Huyện Đông Hải,82111053,Xã Long Điền
34,Tỉnh Cà Mau,82111,Huyện Đông Hải,82111054,Xã Đông Hải
34,Tỉnh Cà Mau,82106,Huyện Hoà Bình,82106055,Xã Hoà Bình
34,Tỉnh Cà Mau,82106,Huyện Hoà Bình,82106056,Xã Vĩnh Mỹ
34,Tỉnh Cà Mau,82106,Huyện Hoà Bình,82106057,Xã Vĩnh Hậu
34,Tỉnh Cà Mau,82109,Huyện Phước Long,82109058,Xã Phước Long
34,Tỉnh Cà Mau,82109,Huyện Phước Long,82109059,Xã Vĩnh Phước
34,Tỉnh Cà Mau,82109,Huyện Phước Long,82109060,Xã Phong Hiệp
34,Tỉnh Cà Mau,82109,Huyện Phước Long,82109061,Xã Vĩnh Thanh
34,Tỉnh Cà Mau,82105,Huyện Vĩnh Lợi,82105062,Xã Vĩnh Lợi
34,Tỉnh Cà Mau,82105,Huyện Vĩnh Lợi,82105063,Xã Hưng Hội
34,Tỉnh Cà Mau,82105,Huyện Vĩnh Lợi,82105064,Xã Châu Thới`;

interface LocationDataRow {
  province_code: string;
  province_name: string;
  'district_code (old)': string;
  'district_name (old)': string;
  ward_code: string;
  ward_name: string;
}

export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
}

let parsedData: LocationDataRow[] = [];
let provincesMap: Map<string, Ward[]> = new Map();

const parseCsvData = () => {
  if (parsedData.length > 0) return; // Already parsed

  const result = Papa.parse<LocationDataRow>(rawCsvData, {
    header: true,
    skipEmptyLines: true,
  });
  parsedData = result.data;

  // Build hierarchical map: Province -> All Wards
  parsedData.forEach(row => {
    if (!provincesMap.has(row.province_name)) {
      provincesMap.set(row.province_name, []);
    }
    const wardsOfProvince = provincesMap.get(row.province_name)!;
    wardsOfProvince.push({ code: row.ward_code, name: row.ward_name });
  });
};

// Call parseCsvData once to initialize
parseCsvData();

export const getAllProvinces = (): Province[] => {
  const uniqueProvinces = new Map<string, Province>();
  
  parsedData.forEach(row => {
    if (!uniqueProvinces.has(row.province_name)) {
      uniqueProvinces.set(row.province_name, {
        code: row.province_code,
        name: row.province_name
      });
    }
  });
  
  return Array.from(uniqueProvinces.values());
};

export const getWardsByProvince = (provinceName: string): Ward[] => {
  return provincesMap.get(provinceName) || [];
};

