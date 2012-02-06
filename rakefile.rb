task :default => [:"deploy"]

namespace :site do

  desc "Deletes '_site' directory"
  task :delete do
    system('rm -rf _site')
  end

  desc "Builds the site"
  task :build => [:delete, :compass] do
    system('jekyll')
  end

  desc "Compiles compass sources"
  task :compass do
    system('compass compile')
  end

  desc "Upload the _site directory using rsync"
  task :rsync => :"build" do
    system('rsync -avrz _site/ oliver@www.oliverbrook.com:/home/oliver/public_html/www.oliverbrook.com/httpdocs')
    puts('Site deployed')
  end

  desc "Create a new blog post"
  task :new_post do
    print "Title: "
    title = $stdin.gets.chomp.strip
    name = title.gsub(/\s+/, '-')
    name = name.gsub(/[^a-zA-Z0-9_-]/, "").downcase
    time = Time.now.strftime("%Y-%m-%d")
    File.open("_posts/#{time}-#{name}.md", "w+") do |file|
      file.puts <<-EOF
---
title: #{title}
description:

layout: post
categories:
---
  EOF
    end
    puts "Created"
  end

end
