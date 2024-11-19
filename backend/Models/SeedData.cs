using CsvHelper;
using CsvHelper.Configuration;
using prid_2425_a01.Helpers;
using System.Globalization;

namespace prid_2425_a01.Models
{
    public class SeedData(FormContext context)
    {
        public void Seed() {
            context.Users.AddRange(ImportCsvData<User, UserMap>(@"Models\Data\users.csv"));
            context.Forms.AddRange(ImportCsvData<Form, FormMap>(@"Models\Data\forms.csv"));
            context.Answers.AddRange(ImportCsvData<Answer, AnswerMap>(@"Models\Data\answers.csv"));
            context.Instances.AddRange(ImportCsvData<Instance, InstanceMap>(@"Models\Data\instances.csv"));
            context.Questions.AddRange(ImportCsvData<Question, QuestionMap>(@"Models\Data\questions.csv"));
            context.UserFormAccesses.AddRange(ImportCsvData<UserFormAccess, UserFormAccessMap>(@"Models\Data\user_form_accesses.csv"));
            context.OptionLists.AddRange(ImportCsvData<OptionList, OptionListMap>(@"Models\Data\option_lists.csv"));
            context.OptionValues.AddRange(ImportCsvData<OptionValue, OptionValueMap>(@"Models\Data\option_values.csv"));


            context.SaveChanges();
        }

        private static List<T> ImportCsvData<T, TM>(string filePath) where TM : ClassMap {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ";",
                HasHeaderRecord = true,
                MissingFieldFound = null,
            };

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, config);
            csv.Context.RegisterClassMap<TM>();

            return csv.GetRecords<T>().ToList();
        }
    }

    internal sealed class UserMap : ClassMap<User>
    {
        public UserMap() {
            Map(u => u.Id).Name("id");
            Map(u => u.LastName).Name("last_name");
            Map(u => u.FirstName).Name("first_name");
            Map(u => u.Email).Name("email");
            Map(u => u.Password)
                .Convert(data => TokenHelper.GetPasswordHash(data.Row.GetField("password") ?? ""));
            Map(u => u.BirthDate).Name("birth_date");
            Map(u => u.Role)
                .Convert(data => Enum.Parse<Role>(data.Row.GetField("role") ?? "", true));
        }
    }

    internal sealed class FormMap : ClassMap<Form>
    {
        public FormMap() {
            Map(f => f.Id).Name("id");
            Map(f => f.Title).Name("title");
            Map(f => f.Description).Name("description");
            Map(f => f.OwnerId).Name("owner");
            Map(f => f.IsPublic).Name("is_public");
        }
    }


    internal sealed class AnswerMap : ClassMap<Answer>
    {
        public AnswerMap() {
            Map(a => a.InstanceId).Name("instance");
            Map(a => a.QuestionId).Name("question");
            Map(a => a.Idx).Name("idx");
            Map(a => a.Value).Name("value");
        }
    }


    internal sealed class InstanceMap : ClassMap<Instance>
    {
        public InstanceMap() {
            Map(i => i.Id).Name("id");
            Map(i => i.FormId).Name("form");
            Map(i => i.UserId).Name("user");
            Map(i => i.Started).Name("started");
            Map(i => i.Completed).Name("completed");
        }
    }

    
    internal sealed class QuestionMap : ClassMap<Question>
    {
        public QuestionMap() {
            Map(q => q.Id).Name("id");
            Map(q => q.FormId).Name("form");
            Map(q => q.Idx).Name("idx");
            Map(q => q.Title).Name("title");
            Map(q => q.Description).Name("description");
            Map(q => q.QuestionType).Name("type")
                .Convert(data => Enum.Parse<QuestionType>(data.Row.GetField("type") ?? "", true));
            Map(q => q.Required).Name("required");
            Map(q => q.OptionListId).Name("option_list");
        }
    }


    internal sealed class UserFormAccessMap : ClassMap<UserFormAccess>
    {
        public UserFormAccessMap() {
            Map(u => u.UserId).Name("user");
            Map(u => u.FormId).Name("form");
            Map(u => u.AccessType).Name("access_type")
                .Convert(data => Enum.Parse<AccessType>(data.Row.GetField("access_type") ?? "", true));
        }
    }


    internal sealed class OptionListMap : ClassMap<OptionList>
    {
        public OptionListMap() {
            Map(o => o.Id).Name("id");
            Map(o => o.Name).Name("name");
            Map(o => o.OwnerId).Name("owner");
        }
    }


    internal sealed class OptionValueMap : ClassMap<OptionValue>
    {
        public OptionValueMap() {
            Map(o => o.Idx).Name("idx");
            Map(o => o.OptionListId).Name("option_list");
            Map(o => o.Value).Name("label");
        }
    }






}
