import { Model } from "sequelize";
import { Invoice, InvoiceItem, Preset, Review } from "../../db";
import getPresetByIdHandler from "./getPresetByIdHandler";

enum PresetTypes {
  ABOUT = "about",
  HOME = "home",
  CART = "card",
  SHOP = "shop",
  DETAIL = "detail",
  PROFILE = "profile",
}
enum PresetCategories {
  BASIC = "basic",
  MEDIUM = "medium",
  PREMIUM = "premium",
}

enum OrderType {
  NAME = "name",
  PRICE = "price",
  PURCHASED = "purchased",
  RATING = "rating",
  RELEASE = "release",
}

enum OrderPriority {
  ASC = "a",
  DESC = "d",
}

interface Filter {
  type?: PresetTypes;
  category?: PresetCategories;
  defaultColor?: string;
}

interface Params {
  ids?: string;
  page?: number;
  quantity?: number;
  orderType?: OrderType;
  orderPriority?: OrderPriority;
  filters?: string;
  userEmail?: string;
}

const getPresetHandler = async ({
  ids,
  page = 1,
  quantity = 10,
  orderType = OrderType.RATING,
  orderPriority = OrderPriority.DESC,
  filters,
  userEmail,
}: Params) => {
  if (ids)
    return await Promise.all(
      ids.split(",").map(async (id) => {
        try {
          return await getPresetByIdHandler(Number(id));
        } catch {
          return null;
        }
      })
    );

  const parsedFilters: Filter = filters ? JSON.parse(filters) : {};
  const allPresets = await Preset.findAll({ where: { ...parsedFilters } });
  const filteredPresets = allPresets.filter(
    (filter) => !filter.dataValues.isDisabled
  );

  const getReviews = async (preset: Model) => {
    const reviews = await Review.findAll({
      where: { presetId: preset.dataValues.id },
    });
    return reviews.map((review) => {
      return {
        message: review.dataValues.ratingMessage,
        rating: review.dataValues.rating,
      };
    });
  };

  const calculateAverageRatings = async (presets: Model[]) => {
    const avgRatings: Record<number, number> = {};

    await Promise.all(
      presets.map(async (preset) => {
        const reviews = await getReviews(preset);
        if (!reviews.length) return 0;
        const totalRatings = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        avgRatings[preset.dataValues.id] = totalRatings / reviews.length;
      })
    );

    return avgRatings;
  };
  const averageRatings = await calculateAverageRatings(filteredPresets);

  const getSells = async (presets: Model[]) => {
    const sells: Record<number, number> = {};

    await Promise.all(
      presets.map(async (preset) => {
        const presetId = preset.dataValues.id;
        const totalSells = await Invoice.count({
          distinct: true,
          col: "userEmail",
          where: { isPaid: true },
          include: [
            {
              model: InvoiceItem,
              where: { presetId },
            },
          ],
        });
        sells[presetId] = totalSells;
      })
    );

    return sells;
  };
  const sells = await getSells(filteredPresets);

  const sortingFunction = (a: Model, b: Model) => {
    const sortOrder = orderPriority === OrderPriority.ASC ? 1 : -1;

    switch (orderType) {
      case OrderType.NAME:
        return sortOrder * a.dataValues.name.localeCompare(b.dataValues.name);
      case OrderType.PRICE:
        return sortOrder * (a.dataValues.price - b.dataValues.price);
      case OrderType.PURCHASED:
        const purchasedA = sells[a.dataValues.id];
        const purchasedB = sells[b.dataValues.id];
        return sortOrder * (purchasedA - purchasedB);
      case OrderType.RELEASE:
        const dateA = new Date(a.dataValues.createdAt).getTime();
        const dateB = new Date(b.dataValues.createdAt).getTime();
        return sortOrder * (dateA - dateB);
      case OrderType.RATING:
        const avgRatingA = averageRatings[a.dataValues.id];
        const avgRatingB = averageRatings[b.dataValues.id];
        return sortOrder * (avgRatingA - avgRatingB);
      default:
        return 0;
    }
  };
  const orderedPresets = filteredPresets.sort(sortingFunction);

  const presets = await Promise.all(
    orderedPresets.map(async (preset) => {
      const { dataValues: data } = preset;
      const reviews = await getReviews(preset);
      const ratingAverage = await calculateAverageRatings([preset]);
      const purchased = await getSells([preset]);
      const boughtPreset = userEmail
        ? await Invoice.findOne({
            where: { isPaid: true, userEmail },
            include: [
              {
                model: InvoiceItem,
                where: { presetId: data.id },
              },
            ],
          })
        : false;

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        color: data.defaultColor,
        type: data.type,
        category: data.category,
        image: data.image,
        url: data.url,
        reviews,
        ratingAverage: ratingAverage[data.id],
        purchased: purchased[data.id],
        isBought: !!boughtPreset,
        isDisabled: data.isDisabled,
        release: data.createdAt,
      };
    })
  );
  return presets.slice(page * quantity - quantity, page * quantity);
};

export default getPresetHandler;
